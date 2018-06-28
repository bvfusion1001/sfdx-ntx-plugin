import { Command, flags } from "@oclif/command";
import { CommandInfo } from "../../lib/CommandInfo";
import { CommandExecutor } from "../../lib/CommandExecutor";

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
    const logSuccess = result => {
      this.log(`Success: ${result}`);
    };

    const createCommand = new CommandInfo(
      "CREATE",
      `sfdx force:org:create -s -a ${scratchAlias} -f ${scratchDef} adminEmail=${email}`,
      logSuccess,
      result => {
        this.error(`Warning:  ${result}`);
      }
    );
    const pushCommand = new CommandInfo(
      "PUSH",
      `sfdx force:source:push -u ${scratchAlias}`,
      logSuccess,
      result => {
        this.error(`Warning:  ${result}`);
      }
    );
    const permsetCommand = new CommandInfo(
      "PERMSET",
      `sfdx force:user:permset:assign -n ${permissionSetName}`,
      logSuccess,
      result => {
        this.error(`Warning:  ${result}`);
      }
    );
    const importCommand = new CommandInfo(
      "IMPORT",
      `sfdx force:data:tree:import -u ${scratchAlias} -p ${planPath}`,
      logSuccess,
      result => {
        this.warn(`Warning:  ${result}`);
      }
    );
    const openCommand = new CommandInfo(
      "OPEN",
      `sfdx force:org:open -u ${scratchAlias} -p ${openPath}`,
      logSuccess,
      result => {
        this.warn(`Warning:  ${result}`);
      }
    );

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

    let executor = new CommandExecutor(commandInfos);
    this.log(executor.generate());
    await executor.execute();
  }
}
