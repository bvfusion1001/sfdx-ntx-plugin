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

      if (commandInfo.doExecute) {
        await new Promise((resolve, reject) => {
          exec(
            commandInfo.command,
            { maxBuffer: 1024 * 1000 * 5 }, // 5 MB max buffer
            (error, stdout, stderr) => {
              if (error) {
                reject(stderr);
              } else {
                resolve(stdout);
              }
            }
          );
        })
          .then(result => {
            commandInfo.successCallback(result);
          })
          .catch(result => {
            commandInfo.failureCallback(result);
          });
      }
      if (commandInfo.runtimeCallback) {
        commandInfo.runtimeCallback();
      }
    }
  }
  generate(): string {
    return `Upcoming command batch:\n${this.commandInfos
      .filter(c => c.doExecute)
      .map(c => "    " + c.command)
      .join("\n")}`;
  }
}
