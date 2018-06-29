import { Command, flags } from "@oclif/command";
import { CommandInfo } from "../../lib/CommandInfo";
import { CommandExecutor } from "../../lib/CommandExecutor";
import cli from "cli-ux";

let usernamesToDelete: string[];

export default class Prune extends Command {
  static description: string =
    "Deletes SFDX configured orgs. Default is to delete unaliased scratch orgs";
  static flags = {
    alias: flags.boolean({
      char: "a",
      description:
        "Deletes all scratch orgs and non-scratch orgs that don't have an alias"
    }),
    expired: flags.boolean({
      char: "e",
      description: "Deletes scratch orgs that are expired"
    }),
    disconnected: flags.boolean({
      char: "d",
      description:
        "Deletes nonscratch orgs with a connected status other than 'Connected'"
    }),
    all: flags.boolean({
      char: "A",
      description:
        "Deletes any org that is expired, doesn't have an alias, or isn't Connected"
    })
  };

  async run() {
    const { flags } = this.parse(Prune);

    const listCommand: CommandInfo = new CommandInfo(
      "sfdx force:org:list --all --json",
      result => {
        const orgResult = JSON.parse(result).result;

        const allOrgs = [...orgResult.nonScratchOrgs, ...orgResult.scratchOrgs];

        let orgsToDelete;
        if (flags.all) {
          orgsToDelete = this.makeUnique([
            ...allOrgs.filter(o => !("alias" in o && o.alias)),
            ...orgResult.scratchOrgs.filter(o => o.isExpired == true),
            ...orgResult.nonScratchOrgs.filter(
              o => o.connectedStatus !== "Connected"
            )
          ]);
        } else if (flags.expired) {
          orgsToDelete = orgResult.scratchOrgs.filter(o => o.isExpired == true);
        } else if (flags.disconnected) {
          orgsToDelete = orgResult.nonScratchOrgs.filter(
            o => o.connectedStatus !== "Connected"
          );
        } else {
          orgsToDelete = allOrgs.filter(o => !("alias" in o && o.alias));
        }
        usernamesToDelete = orgsToDelete.map(o => o.username);
      },
      result => this.error(result)
    );

    const listExecutor = new CommandExecutor([listCommand]);
    this.log(listExecutor.generate());
    await listExecutor.execute();

    const deleteCommands = usernamesToDelete.map(u => {
      return new CommandInfo(
        `sfdx force:org:delete -u ${u} -p`,
        result => this.log(`${result}`),
        result => this.warn(`${result}`)
      );
    });

    cli.action.start(
      "Executing robust commands with the little data provided :)"
    );
    const deleteExecutor = new CommandExecutor(deleteCommands);
    this.log(deleteExecutor.generate());
    await deleteExecutor.execute();
    cli.action.stop("Well that was nice");
  }

  private makeUnique(array: object[]) {
    let a = array.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
  }
}
