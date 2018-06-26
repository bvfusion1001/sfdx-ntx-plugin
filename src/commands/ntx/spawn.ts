import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
// import { Org } from '../lib/something'
// import { Test } from '../lib/test'
// import { SfdxCommand, core } from '@salesforce/command'
import { exec } from "child_process";
import { promisify } from "util";

export default class Spawn extends Command {
  static description = `
Creates a new scratch org,
pushes in data,
assigns a permissionset,
and opens the org.
  `;
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
    const createCommand = `sfdx force:org:create -s -a ${scratchAlias} -f ${scratchDef} adminEmail=${email}`;
    const pushCommand = `sfdx force:source:push -u ${scratchAlias}`;
    const permsetCommand = `sfdx force:user:permset:assign -n ${permissionSetName}`;
    const importCommand = `sfdx force:data:tree:import -u ${scratchAlias} -p ${planPath}`;
    const openCommand = `sfdx force:org:open -u ${scratchAlias} -p ${openPath}`;
    const indent = "  ";
    const newLine = "\n";

    let commands: string[] = [createCommand, pushCommand];
    if (permissionSetName) {
      commands.push(permsetCommand);
    } else {
      this.warn(
        "PermissionSet not specified and will not be assigned." +
          'To assign a permissionset, execute: "ntx:perm [PERMISSIONSET NAME]"'
      );
      // TODO: include command for how to set permset later
    }
    commands.push(importCommand, openCommand);

    const finalCommand = commands.map(c => indent + c).join(newLine);

    cli.action.start(
      "Executing robust commands with the little data provided :) "
    );
    // Log Execution
    this.log("To Execute:");
    this.log(finalCommand);

    const promiseExec = promisify(exec);
    while (commands) {
      const command = commands.shift();
      if (!command) {
        this.log(`Command corrupt: ${command}`);
        break;
      }

      const result = await promiseExec(command)
        .then(result => {
          this.log(`then ${result}`);
          return true;
        })
        .catch(error => {
          this.error(`Error: ${error}`);
          return false;
        });

      if (!result) {
        this.error(`Command failed: ${command}`);
        break;
      }
    }

    cli.action.stop();
  }
}
