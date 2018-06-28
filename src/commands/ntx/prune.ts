import { Command, flags } from "@oclif/command";
import { CommandInfo } from "../../lib/CommandInfo";
import { CommandExecutor } from "../../lib/CommandExecutor";

export default class Prune extends Command {
  static description =
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

    const listCommand = new CommandInfo(
      "LIST",
      "sfdx force:org:list --all --json",
      result => {
        const orgResult = JSON.parse(result).result;

        const allOrgs = [...orgResult.nonScratchOrgs, ...orgResult.scratchOrgs];

        let usernamesToDelete;
        if (flags.all) {
          usernamesToDelete = this.makeUnique([
            ...allOrgs
              .filter(o => !("alias" in o && o.alias))
              .map(o => o.username),
            ...orgResult.scratchOrgs.filter(o => o.isExpired == true),
            ...orgResult.nonScratchOrgs.filter(
              o => o.connectedStatus !== "Connected"
            )
          ]);
        } else if (flags.expired) {
          usernamesToDelete = orgResult.scratchOrgs
            .filter(o => o.isExpired == true)
            .map(o => o.username);
        } else if (flags.disconnected) {
          usernamesToDelete = orgResult.nonScratchOrgs
            .filter(o => o.connectedStatus !== "Connected")
            .map(o => o.username);
        } else {
          usernamesToDelete = allOrgs
            .filter(o => !("alias" in o && o.alias))
            .map(o => o.username);
        }
        this.log("delete", usernamesToDelete);
      },
      result => {
        this.error(`Warning: ${JSON.stringify(result)}`);
      }
    );

    const listExecutor = new CommandExecutor([listCommand]);
    this.log(listExecutor.generate());

    await listExecutor.execute();
  }

  makeUnique(array) {
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
