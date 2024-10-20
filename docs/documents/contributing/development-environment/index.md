[**playnite-web-app**](../../../README.md) • **Docs**

***

[playnite-web-app](../../../README.md) / contributing/development-environment/index

# Development Environment

- [Development Environment](#development-environment)
  - [Overview](#overview)
  - [Running Playnite Web](#running-playnite-web)
  - [Playnite Web Plugin Development](#playnite-web-plugin-development)

## Overview

There are a few options for running Playnite Web for local development. Choose and follow one of the paths below. Then proceed to the next section.

1. (preferred) [Local environment](local-environment.md), directly on your development machine (requires installing required tooling such as Node.js, yarn, etc.).
2. Via a [GitHub codespace or Docker dev container](codespaces.md) (the plugin cannot be run this way).

> Note the second and third options maybe encounter issues or additional configuration when running component and E2E tests.

## Running Playnite Web

| Application      | Command                           | Notes                                                                                                                                                                                                      |
| :--------------- | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playnite Web App | `yarn run start`                  | Run Playnite Web application locally. Navigate to [https://localhost:3000](https://localhost:3000) in a browser. Environment variables are pulled from `./apps/playnite-web/local.env`.                    |
| Playnite Web App | `yarn run test/components`        | Run component tests for development.                                                                                                                                                                       |
| Playnite Web App | `yarn run test/components/update` | Run component tests with intention to update a baseline screenshot.                                                                                                                                        |
| Playnite Web App | `yarn yarn run test/e2e`          | Run end-to-end (e2e) tests for development (including visual regression capabilities). A consistent database restored along with consistent game assets. This ensures a reliable data set to test against. |
| Playnite Web App | `yarn yarn run test/e2e/update`   | Run end-to-end (e2e) tests with intention to update a baseline screenshot.                                                                                                                                 |

## Playnite Web Plugin Development

To develop the Playnite Web plugin, a Windows machine is required. Playnite must be installed. Recommendation is to use Visual Studio Community edition for development.

1. Install required software
   - Playnite
   - Visual Studio
2. Open the solution file in Visual Studio; located in `apps/PlayniteWebPlugin/src/PlayniteWeb.sln`.
3. Build the solution.
4. Open Playnite and add the path to the bin directory as a local plugin. This setting is found under the Developer section in the settings.
5. Debugging opens Playnite with the plugin installed.
