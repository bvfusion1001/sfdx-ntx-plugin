export class CommandInfo {
  // Required
  readonly command: string;
  readonly successCallback: Function;
  readonly failureCallback: Function;

  // Optional
  doExecute: boolean = true;
  runtimeCallback: Function;

  constructor(
    command: string,
    successCallback: Function,
    failureCallback: Function
  ) {
    this.command = command;
    this.successCallback = successCallback;
    this.failureCallback = failureCallback;
  }

  dontExecute(): CommandInfo {
    this.doExecute = false;
    return this;
  }

  addRuntimeCallback(runtimeCallback: Function): CommandInfo {
    this.runtimeCallback = runtimeCallback;
    return this;
  }
}
