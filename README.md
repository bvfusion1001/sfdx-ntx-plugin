sfdx-ntx-plugin
===============

A plugin for the Salesforce CLI with short commands and useful, overridable default values.

[![Version](https://img.shields.io/npm/v/sfdx-ntx-plugin.svg)](https://npmjs.org/package/sfdx-ntx-plugin)
[![CircleCI](https://circleci.com/gh/bvfusion1001/sfdx-ntx-plugin/tree/master.svg?style=shield)](https://circleci.com/gh/bvfusion1001/sfdx-ntx-plugin/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/bvfusion1001/sfdx-ntx-plugin?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-ntx-plugin/branch/master)
[![Codecov](https://codecov.io/gh/bvfusion1001/sfdx-ntx-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/bvfusion1001/sfdx-ntx-plugin)
[![Greenkeeper](https://badges.greenkeeper.io/bvfusion1001/sfdx-ntx-plugin.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/bvfusion1001/sfdx-ntx-plugin/badge.svg)](https://snyk.io/test/github/bvfusion1001/sfdx-ntx-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-ntx-plugin.svg)](https://npmjs.org/package/sfdx-ntx-plugin)
[![License](https://img.shields.io/npm/l/sfdx-ntx-plugin.svg)](https://github.com/bvfusion1001/sfdx-ntx-plugin/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-ntx-plugin
$ sfdx-ntx-plugin COMMAND
running command...
$ sfdx-ntx-plugin (-v|--version|version)
sfdx-ntx-plugin/0.0.0 win32-x64 node-v8.9.4
$ sfdx-ntx-plugin --help [COMMAND]
USAGE
  $ sfdx-ntx-plugin COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx-ntx-plugin hello:org [FILE]`](#sfdx-ntx-plugin-helloorg-file)
* [`sfdx-ntx-plugin ntx:spawn`](#sfdx-ntx-plugin-ntxspawn)

## `sfdx-ntx-plugin hello:org [FILE]`

Prints a greeting and your org id(s)!

```
USAGE
  $ sfdx-ntx-plugin hello:org [FILE]

OPTIONS
  -f, --force                                      example boolean flag
  -n, --name=name                                  name to print
  -u, --targetusername=targetusername              username or alias for the target org; overrides default target org
  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org
  --apiversion=apiversion                          override the api version used for api requests made by this command
  --json                                           format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)   logging level for this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [src\commands\hello\org.ts](https://github.com/bvfusion1001/sfdx-ntx-plugin/blob/v0.0.0/src\commands\hello\org.ts)_

## `sfdx-ntx-plugin ntx:spawn`

Creates a new scratch org,

```
USAGE
  $ sfdx-ntx-plugin ntx:spawn

OPTIONS
  -a, --alias=alias                    set an alias for the created scratch org
  -e, --email=email                    email for the created scratch org user
  -f, --definitionfile=definitionfile  path to a scratch org definition file
  -n, --permsetname=permsetname        the name of the permission set to assign
  -o, --openpath=openpath              navigation URL path
  -p, --planpath=planpath              path to plan to insert sample record data

DESCRIPTION
  Creates a new scratch org,
  pushes in data,
  assigns a permissionset,
  and opens the org.
```

_See code: [src\commands\ntx\spawn.ts](https://github.com/bvfusion1001/sfdx-ntx-plugin/blob/v0.0.0/src\commands\ntx\spawn.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
