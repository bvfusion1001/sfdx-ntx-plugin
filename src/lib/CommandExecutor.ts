import { CommandInfo } from "./CommandInfo";
import cli from "cli-ux";
import { exec } from "child_process";
import { promisify } from "util";

export class CommandExecutor {
  readonly commandInfos: CommandInfo[];
  constructor(commandInfos: CommandInfo[]) {
    this.commandInfos = commandInfos;
  }
  async execute() {
    const promiseExec = promisify(exec);

    cli.action.start(
      "Executing robust commands with the little data provided :)"
    );

    while (this.commandInfos.length) {
      const commandInfo = this.commandInfos.shift();

      // console.log("doExecute", commandInfo.doExecute);
      if (commandInfo.doExecute) {
        try {
          const result = await promiseExec(commandInfo.command);
          // console.log("result", result);
          if (result.stdout) {
            commandInfo.successCallback(result.stdout);
          } else {
            commandInfo.failureCallback(result.stderr);
          }
        } catch (error) {
          // console.log("error", error);
          commandInfo.failureCallback(error);
        }
      } else {
        commandInfo.dontExecuteCallback();
      }
    }
    cli.action.stop("Well that was nice");
  }
  generate() {
    return `Time to execute the following:\n${this.commandInfos
      .filter(c => c.doExecute)
      .map(c => "    " + c.command)
      .join("\n")}`;
  }
}
