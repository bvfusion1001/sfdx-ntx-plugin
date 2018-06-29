import { CommandInfo } from "./CommandInfo";
import { exec } from "child_process";

export class CommandExecutor {
  readonly commandInfos: CommandInfo[];
  constructor(commandInfos: CommandInfo[]) {
    this.commandInfos = commandInfos;
  }
  async execute() {
    while (this.commandInfos.length) {
      const commandInfo = this.commandInfos.shift();

      // console.log("doExecute", commandInfo.doExecute);
      if (commandInfo.doExecute) {
        // console.log("***execute", commandInfo);
        await new Promise((resolve, reject) => {
          exec(
            commandInfo.command,
            { maxBuffer: 1024 * 1000 * 5 }, // 5 MB max buffer
            (error, stdout, stderr) => {
              if (error) {
                // console.log("***stderr", stderr);
                reject(stderr);
              } else {
                // console.log("***stdout", stdout);
                resolve(stdout);
              }
            }
          );
        })
          .then(result => {
            // console.log("***then", result);
            commandInfo.successCallback(result);
          })
          .catch(result => {
            // console.log("***catch", result);
            commandInfo.failureCallback(result);
          });
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
