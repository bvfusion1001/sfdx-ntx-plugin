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

      if (commandInfo.doExecute) {
        try {
          const result = await promiseExec(commandInfo.command);
          if (result.stdout) {
            commandInfo.successCallback(result.stdout);
          } else {
            commandInfo.failureCallback(result.stderr);
          }
        } catch (error) {
          commandInfo.failureCallback(error);
        }

        // const promiseToExecute = new Promise((resolve, reject) => {
        //   exec(commandInfo.command, (error, stdout, stderr) => {
        //     console.log("error:", error);
        //     if (!error) {
        //       console.log("stdout:", stdout);
        //       var r = commandInfo.successCallback(stdout);
        //       resolve(r);
        //     } else {
        //       console.log("stderr:", stderr);
        //       reject(commandInfo.failureCallback(stderr));
        //     }
        //   });
        // });
        // return await promiseToExecute;

        // const promiseResults = await promiseExec(commandInfo.command)
        //   .then(result => {
        //     return commandInfo.successCallback(result);
        //   })
        //   .catch(result => {
        //     commandInfo.failureCallback(result);
        //   });
        // console.log("then2: ", promiseResults);
        // return promiseResults;
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
