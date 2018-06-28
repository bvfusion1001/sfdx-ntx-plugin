export class CommandInfo {
  // Required
  readonly action: string;
  readonly command: string;
  readonly successCallback: Function;
  readonly failureCallback: Function;

  // Optional
  doExecute: boolean = true;
  dontExecuteCallback: Function;

  constructor(
    action: string,
    command: string,
    successCallback: Function,
    failureCallback: Function
  ) {
    this.action = action;
    this.command = command;
    this.successCallback = successCallback;
    this.failureCallback = failureCallback;
  }

  dontExecute(dontExecuteCallback: Function) {
    this.doExecute = false;
    this.dontExecuteCallback = dontExecuteCallback;
  }
}
