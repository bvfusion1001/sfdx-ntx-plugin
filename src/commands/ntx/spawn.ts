import { Command, flags } from "@oclif/command";
import { CommandInfo } from "../../lib/CommandInfo";
import { CommandExecutor } from "../../lib/CommandExecutor";
import cli from "cli-ux";
import { EnvironmentRepository } from "../../lib/EnvironmentRepository";

export default class Spawn extends Command {
  static description: string = `Creates a new scratch org,\npushes in data,\nassigns a permissionset,\nimports sample data,\nand opens the org.`;

  static flags = {
    alias: flags.string({
      char: "a",
      description:
        "Set an alias for the created scratch org. Priority: flag, environment variable (SCRATCH_ORG_ALIAS)"
    }),
    definitionfile: flags.string({
      char: "f",
      description:
        "Path to a scratch org definition file. Priority: flag, environment variable (SCRATCH_DEF_PATH), 'config/project-scratch-def.json'"
    }),
    email: flags.string({
      char: "e",
      description:
        "Email for the created scratch org user. Priority: flag, environment variable (ADMIN_EMAIL)"
    }),
    permsetname: flags.string({
      char: "n",
      description:
        "The name of the permission set to assign. Priority: flag, environment variable (PERMISSION_SET_NAME)"
    }),
    planpath: flags.string({
      char: "p",
      description:
        "Path to plan to insert sample record data. Priority: flag, environment variable ('SAMPLE_DATA_PLAN_PATH')"
    }),
    openpath: flags.string({
      char: "o",
      description: "Navigation URL path. Priority: flag, 'lightning'"
    }),
    generatepassword: flags.boolean({
      char: "g",
      description: "Generates a password and prints to the console"
    })
  };

  async run() {
    const environmentRepository = new EnvironmentRepository();

    const defaults = {
      definitionFile: "config/project-scratch-def.json",
      openPath: "lightning"
    };

    const { flags } = this.parse(Spawn);

    const scratchAlias =
        flags.alias || environmentRepository.get("SCRATCH_ORG_ALIAS") || null,
      scratchDef =
        flags.definitionfile ||
        environmentRepository.get("SCRATCH_DEF_PATH") ||
        defaults.definitionFile,
      email = flags.email || environmentRepository.get("ADMIN_EMAIL") || null,
      permissionSetName =
        flags.permsetname ||
        environmentRepository.get("PERMISSION_SET_NAME") ||
        null,
      planPath =
        flags.planpath ||
        environmentRepository.get("SAMPLE_DATA_PLAN_PATH") ||
        null,
      openPath = flags.openpath || defaults.openPath;

    const aliasArgument = scratchAlias ? `-a ${scratchAlias} ` : "",
      usernameArgument = scratchAlias ? `-u ${scratchAlias}` : "";
    const emailArgument = email ? `adminEmail=${email}` : "";
    const createCommand = new CommandInfo(
      `sfdx force:org:create -s ${aliasArgument}-f ${scratchDef} ${emailArgument}`,
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
