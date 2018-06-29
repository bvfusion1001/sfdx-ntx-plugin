import { Command, flags } from "@oclif/command";
import { CommandInfo } from "../../lib/CommandInfo";
import { CommandExecutor } from "../../lib/CommandExecutor";
import cli from "cli-ux";

export default class Spawn extends Command {
  static description: string = `Creates a new scratch org,\npushes in data,\nassigns a permissionset,\nimports sample data,\nand opens the org.`;
  // TODO: learn about help
  // TODO: include parameter defaults/overrides/priorities in help or descriptions
  static flags = {
    alias: flags.string({
      char: "a",
      description:
        "set an alias for the created scratch org (default: flag, 'scratch-alias')"
    }),
    definitionfile: flags.string({
      char: "f",
      description:
        "path to a scratch org definition file (default: 'config/project-scratch-def.json')"
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
    openpath: flags.string({
      char: "o",
      description: "navigation URL path (default: 'lightning')"
    }),
    generatepassword: flags.boolean({
      char: "g",
      description: "generates a password and prints to the console"
    })
  };

  async run() {
    const defaults = {
      definitionFile: "config/project-scratch-def.json",
      openPath: "lightning"
    };

    const { flags } = this.parse(Spawn);

    // TODO: Accept environment variables for each of the following variables
    const scratchAlias = flags.alias || null,
      scratchDef = flags.definitionfile || defaults.definitionFile,
      email = flags.email || null,
      permissionSetName = flags.permsetname || null,
      planPath = flags.planpath || null,
      openPath = flags.openpath || defaults.openPath;

    const aliasArgument = scratchAlias ? `-a ${scratchAlias}` : "",
      usernameArgument = scratchAlias ? `-u ${scratchAlias}` : "";
    const emailArgument = email ? `adminEmail=${email}` : "";
    const createCommand = new CommandInfo(
      `sfdx force:org:create -s ${aliasArgument} -f ${scratchDef} ${emailArgument}`,
      result => this.log(`${result}`),
      result => this.error(`${result}`)
    );
    if (!scratchAlias) {
      createCommand.addRuntimeCallback(() => {
        this.warn(
          "It looks like you didn't specify an alias.\nTo assign, execute: 'sfdx force:alias:set [SCRATCH ALIAS]=[This org username]',\nor while spawning include: '-a [SCRATCH ALIAS]'"
        );
      });
    }

    const pushCommand = new CommandInfo(
      `sfdx force:source:push ${usernameArgument}`,
      result => this.log(`${result}`),
      result => this.error(`${result}`)
    );
    const permsetCommand = new CommandInfo(
      `sfdx force:user:permset:assign ${usernameArgument} -n ${permissionSetName}`,
      result => this.log(`${result}`),
      result => this.error(`${result}`)
    );
    const planPathArgument = planPath ? `-p ${planPath}` : "";
    const importCommand = new CommandInfo(
      `sfdx force:data:tree:import ${usernameArgument} ${planPathArgument}`,
      result => this.log(`${result}`),
      result => this.warn(`${result}`)
    );
    const openCommand = new CommandInfo(
      `sfdx force:org:open ${usernameArgument} -p ${openPath}`,
      result => this.log(`${result}`),
      result => this.warn(`${result}`)
    );
    const passwordCommand = new CommandInfo(
      `sfdx force:user:password:generate ${usernameArgument}`,
      result => this.log(`${result}`),
      result => this.error(`${result}`)
    );

    if (!permissionSetName) {
      permsetCommand.dontExecute().addRuntimeCallback(() => {
        this.warn(
          "PermissionSet not specified and will not be assigned.\nTo assign a permissionset, execute: 'sfdx force:user:permset:assign -n [PERMISSIONSET NAME]'"
        );
      });
    }

    let commandInfos: CommandInfo[] = [
      createCommand,
      pushCommand,
      permsetCommand
    ];
    if (planPath) {
      commandInfos.push(importCommand);
    }
    commandInfos.push(openCommand);
    if (flags.generatepassword) {
      commandInfos.push(passwordCommand);
    }

    cli.action.start(
      "Executing robust commands with the little data provided :)"
    );
    let executor: CommandExecutor = new CommandExecutor(commandInfos);
    this.log(executor.generate());
    await executor.execute();
    cli.action.stop("Well that was nice");
  }
}
