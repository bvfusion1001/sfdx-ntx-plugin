export class CommandInfo {
  // Required
  readonly command: string;
  readonly successCallback: Function;
  readonly failureCallback: Function;

  // Optional
  doExecute: boolean = true;
  dontExecuteCallback: Function;

  constructor(
    command: string,
    successCallback: Function,
    failureCallback: Function
  ) {
    this.command = command;
    this.successCallback = successCallback;
    this.failureCallback = failureCallback;
  }

  dontExecute(dontExecuteCallback: Function) {
    this.doExecute = false;
    this.dontExecuteCallback = dontExecuteCallback;
  }
}
