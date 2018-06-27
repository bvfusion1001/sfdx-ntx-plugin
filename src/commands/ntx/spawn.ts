import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import { exec } from "child_process";
import { promisify } from "util";

export default class Spawn extends Command {
  static description = `Creates a new scratch org,\npushes in data,\nassigns a permissionset,\nimports sample data,\nand opens the org.`;
  // TODO: learn about help
  // TODO: include parameter defaults/overrides/priorities in help or descriptions
  static flags = {
    alias: flags.string({
      char: "a",
      description: "set an alias for the created scratch org"
    }),
    definitionfile: flags.string({
      char: "f",
      description: "path to a scratch org definition file"
    }),
    email: flags.string({
      char: "e",
      description: "email for the created scratch org user"
    }),
    permsetname: flags.string({
      char: "n",
      description: "the name of the permission set to assign"
    }),
    planpath: flags.string({
      char: "p",
      description: "path to plan to insert sample record data"
    }),
    openpath: flags.string({ char: "o", description: "navigation URL path" })
  };

  async run() {
    // TODO: Replace some of these with environment variables
    // TODO: Prompt for permissionset or skip that step
    const defaults = {
      alias: "scratch-alias",
      definitionFile: "config/project-scratch-def.json",
      email: "ecullen@drawloop.com",
      planPath: "record-data/hello-ddp/hello-ddp-plan.json",
      openPath: "lightning"
    };

    const { flags } = this.parse(Spawn);

    const scratchAlias = flags.alias || defaults.alias,
      scratchDef = flags.definitionfile || defaults.definitionFile,
      email = flags.email || defaults.email,
      permissionSetName = flags.permsetname || null,
      planPath = flags.planpath || defaults.planPath,
      openPath = flags.openpath || defaults.openPath;

    // if (!permissionSetName) {
    //   permissionSetName = await cli.prompt('Specify a PermissionSet name')
    // }
    const createCommand = new CommandInfo(
      "CREATE",
      `sfdx force:org:create -s -a ${scratchAlias} -f ${scratchDef} adminEmail=${email}`
    );
    const pushCommand = new CommandInfo(
      "PUSH",
      `sfdx force:source:push -u ${scratchAlias}`
    );
    const permsetCommand = new CommandInfo(
      "PERMSET",
      `sfdx force:user:permset:assign -n ${permissionSetName}`
    );
    const importCommand = new CommandInfo(
      "IMPORT",
      `sfdx force:data:tree:import -u ${scratchAlias} -p ${planPath}`
    );
    const openCommand = new CommandInfo(
      "OPEN",
      `sfdx force:org:open -u ${scratchAlias} -p ${openPath}`
    );
    const indent = "    ";
    const newLine = "\n";

    let commandInfos: CommandInfo[] = [createCommand, pushCommand];
    if (permissionSetName) {
      commandInfos.push(permsetCommand);
    } else {
      this.warn(
        "PermissionSet not specified and will not be assigned." +
          'To assign a permissionset, execute: "sfdx ntx:perm [PERMISSIONSET NAME]"'
      );
      // TODO: include command for how to set permset later
    }
    commandInfos.push(importCommand, openCommand);

    const finalCommand = commandInfos
      .map(c => indent + c.command)
      .join(newLine);

    cli.action.start(
      "Executing robust commands with the little data provided :)"
    );
    // Log Execution
    this.log("Time to execute the following:");
    this.log(finalCommand);

    const promiseExec = promisify(exec);

    while (commandInfos.length) {
      const commandInfo = commandInfos.shift();
      if (!commandInfo) {
        this.error(`Unexpected or corrupt command: ${commandInfo.command}`);
      }

      this.log(commandInfo.command);
      await promiseExec(commandInfo.command)
        .then(result => {
          this.log(`Success: ${result.stdout}`);
        })
        .catch(result => {
          const errorMessage = `Warning:  ${result.stderr}`;
          if (["CREATE", "PUSH"].includes(commandInfo.action)) {
            this.error(errorMessage);
          } else {
            this.warn(errorMessage);
          }
        });
    }

    cli.action.stop("Well that was nice");
  }
}

class CommandInfo {
  action: string;
  command: string;

  constructor(action: string, command: string) {
    this.action = action;
    this.command = command;
  }
}
