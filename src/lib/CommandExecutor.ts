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
        // console.log("***execute", commandInfo);
        await new Promise((resolve, reject) => {
          exec(
            commandInfo.command,
            { maxBuffer: 1024 * 500 },
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

        // try {
        //   const result = await promiseExec(commandInfo.command);
        //   // console.log("result", result);
        //   if (result.stdout) {
        //     commandInfo.successCallback(result.stdout);
        //   } else {
        //     commandInfo.failureCallback(result.stderr);
        //   }
        // } catch (error) {
        //   // console.log("error", error);
        //   commandInfo.failureCallback(error);
        // }
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
