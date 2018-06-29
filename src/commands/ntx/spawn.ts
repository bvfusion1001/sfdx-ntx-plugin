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
    openpath: flags.string({ char: "o", description: "navigation URL path" }),
    generatepassword: flags.boolean({
      char: "g",
      description: "generates a password and prints to the console"
    })
  };

  async run() {
    // TODO: Replace some of these with environment variables
    // TODO: Prompt for permissionset or skip that step
    const defaults = {
      alias: "scratch-alias",
      definitionFile: "config/project-scratch-def.json",
      planPath: "record-data/hello-ddp/hello-ddp-plan.json",
      openPath: "lightning"
    };

    const { flags } = this.parse(Spawn);

    const scratchAlias = flags.alias || defaults.alias,
      scratchDef = flags.definitionfile || defaults.definitionFile,
      email = flags.email || null,
      permissionSetName = flags.permsetname || null,
      planPath = flags.planpath || defaults.planPath,
      openPath = flags.openpath || defaults.openPath;

    const emailArgument = email ? ` adminEmail=${email}` : "";
    const createCommand = new CommandInfo(
      `sfdx force:org:create -s -a ${scratchAlias} -f ${scratchDef}${emailArgument}`,
      result => this.log(`${result}`),
      result => this.error(`${result}`)
    );
    const pushCommand = new CommandInfo(
      `sfdx force:source:push -u ${scratchAlias}`,
      result => this.log(`${result}`),
      result => this.error(`${result}`)
    );
    const permsetCommand = new CommandInfo(
      `sfdx force:user:permset:assign -n ${permissionSetName}`,
      result => this.log(`${result}`),
      result => this.error(`${result}`)
    );
    const importCommand = new CommandInfo(
      `sfdx force:data:tree:import -u ${scratchAlias} -p ${planPath}`,
      result => this.log(`${result}`),
      result => this.warn(`${result}`)
    );
    const openCommand = new CommandInfo(
      `sfdx force:org:open -u ${scratchAlias} -p ${openPath}`,
      result => this.log(`${result}`),
      result => this.warn(`${result}`)
    );
    const passwordCommand = new CommandInfo(
      `sfdx force:user:password:generate -u ${scratchAlias}`,
      result => this.log(`${result}`),
      result => this.log(`${result}`)
    );

    // if (!permissionSetName) {
    //   permissionSetName = await cli.prompt('Specify a PermissionSet name')
    // }
    if (!permissionSetName) {
      permsetCommand.dontExecute(() => {
        this.warn(
          "PermissionSet not specified and will not be assigned." +
            'To assign a permissionset, execute: "sfdx ntx:perm [PERMISSIONSET NAME]"'
        );
      });
    }

    let commandInfos: CommandInfo[] = [
      createCommand,
      pushCommand,
      permsetCommand,
      importCommand,
      openCommand
    ];
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
