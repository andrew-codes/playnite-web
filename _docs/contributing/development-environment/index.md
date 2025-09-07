# Development Environment

- [Development Environment](#development-environment)
  - [Setup](#setup)
  - [Running Playnite Web](#running-playnite-web)
  - [Playnite Web Plugin Development](#playnite-web-plugin-development)

## Setup

There are a few options for running Playnite Web for local development. Choose a path and follow its corresponding guide. Then, return to continue the next section.

1. [Local environment](./local-environment.md): use your local machine as the development environment. This requires installing more software than the number 2, but may have a smoother experience.
2. [GitHub code spaces](./codespaces.md).
3. [dev container](./dev-container.md).

## Running Playnite Web

| Application      | Command                                                            | Notes                                                                                                                                                                                                      |
| :--------------- | :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playnite Web App | `yarn nx run playnite-web:start`                                   | Run Playnite Web application locally. Navigate to [http://localhost:3000](http://localhost:3000) in a browser. Environment variables are pulled from `./apps/playnite-web/local.env`.                      |
| Playnite Web App | `yarn nx run playnite-web:test/components`                         | Run component tests for development.                                                                                                                                                                       |
| Playnite Web App | `yarn nx run playnite-web:test/components/update`                  | Run component tests with intention to update a baseline screenshot.                                                                                                                                        |
| Playnite Web App | `yarn nx run playnite-web:test/components/update $GLOB_FILE_MATCH` | Run component tests with intention to update baseline screenshots. Runs only tests matching glob CLI parameter; e.g. `yarn nx run playnite-web:test/components/update FilterForm*`                         |
| Playnite Web App | `yarn nx run playnite-web-app:test/e2e/dev`                        | Run end-to-end (e2e) tests for development (including visual regression capabilities). A consistent database restored along with consistent game assets. This ensures a reliable data set to test against. |
| Playnite Web App | `yarn nx run playnite-web-app:test/e2e/update`                     | Run end-to-end (e2e) tests with intention to update a baseline screenshot.                                                                                                                                 |
| Playnite Web App | `yarn nx run playnite-web-app:test/e2e/update $GLOB_FILE_MATCH`    | Run end-to-end (e2e) tests with intention to update a baseline screenshot. Runs only tests matching glob CLI parameter' e.g. `yarn nx run playnite-web-app:test/e2e/update **/browse*`                     |
| Playnite Web App | `yarn nx run playnite-web-app:test/e2e`                            | Build and package to run end-to-end (e2e) tests. Note updates to the source application will not be reflected after running this command and will require re-running the command.                          |

## Playnite Web Plugin Development

To develop the Playnite Web plugin, a Windows machine is required. Playnite must be installed. Recommendation is to use Visual Studio Community edition for development.

1. Install required software
   - Playnite
   - Visual Studio
2. Open the solution file in Visual Studio; located in `apps/PlayniteWebPlugin/src/PlayniteWeb.sln`.
3. Build the solution.
4. Open Playnite and add the path to the bin directory as a local plugin. This setting is found under the Developer section in the settings.
5. Debugging opens Playnite with the plugin installed.
