import { CommandInfo } from "./CommandInfo";
import { exec } from "child_process";
import { promisify } from "util";

export class CommandExecutor {
  readonly commandInfos: CommandInfo[];
  constructor(commandInfos: CommandInfo[]) {
    this.commandInfos = commandInfos;
  }
  async execute() {
    const promiseExec = promisify(exec);

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
  }
  generate() {
    // console.log(this.commandInfos);
    return `Upcoming command batch:\n${this.commandInfos
      .filter(c => c.doExecute)
      .map(c => "    " + c.command)
      .join("\n")}`;
  }
}
