# Development Environment

- [Development Environment](#development-environment)
  - [Setup](#setup)
  - [Running Application/Services](#running-applicationservices)
    - [Playnite Web App](#playnite-web-app)
    - [Game Assets Processor](#game-assets-processor)
    - [Database/schema Changes](#databaseschema-changes)
  - [Playnite Web Plugin Development](#playnite-web-plugin-development)

## Setup

There are a few options for running Playnite Web for local development. Choose a path and follow its corresponding guide. Then, return to continue the next section.

> Note code spaces and dev containers do not work well with E2E tests, so it is recommended to use Option 1 below.

1. [Local environment](./local-environment.md): use your local machine as the development environment. This requires installing more software than the number 2, but may have a smoother experience.
2. [GitHub code spaces](./codespaces.md).
3. [dev container](./dev-container.md).

## Running Application/Services

You can view all available projects and tasks via `yarn nx graph`. This will open an explorer in a web browser.

### Playnite Web App

| Command                                                            | Notes                                                                                                                                                                                                                                         |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn nx start playnite-web-app`                                   | Run Playnite Web application locally. Will automatically start dependent services via docker-compose (Database and MQTT). Navigate to [http://localhost:3000](http://localhost:3000) in a browser.                                            |
| `yarn nx demo-data playnite-web-app`                               | Run only after Playnite Web is running; will seed database with demo data. To remove all data, simply delete the Database container that was started via the start target.                                                                    |
| `yarn nx test/components playnite-web-app`                         | Run component tests for development.                                                                                                                                                                                                          |
| `yarn nx test/components/update playnite-web-app`                  | Run component tests with intention to update a baseline screenshot.                                                                                                                                                                           |
| `yarn nx test/components/update playnite-web-app $GLOB_FILE_MATCH` | Run component tests with intention to update baseline screenshots. Runs only tests matching glob CLI parameter; e.g. `yarn nx run playnite-web:test/components/update FilterForm*`                                                            |
| `yarn nx test/e2e/dev playnite-web-app`                            | Run end-to-end (e2e) tests for development (including visual regression capabilities). The database will be cleared and repopulated before every test to ensure a consistent dataset for testing.                                             |
| `yarn nx test/e2e/update playnite-web-app`                         | Run end-to-end (e2e) tests with intention to update a baseline screenshot.                                                                                                                                                                    |
| `yarn nx test/e2e/update playnite-web-app $GLOB_FILE_MATCH`        | Run end-to-end (e2e) tests with intention to update a baseline screenshot. Runs only tests matching glob CLI parameter' e.g. `yarn nx run playnite-web-app:test/e2e/update **/browse*`                                                        |
| `yarn nx test/e2e playnite-web-app`                                | Build and package to run end-to-end (e2e) tests. Note updates to the source application will not be reflected after running this command and will require re-running the command. Tests packaged docker image.                                |
| `yarn nx test/e2e playnite-web-app --configuration dev`            | Build and package to run end-to-end (e2e) tests, but for debugging CI failures. Note updates to the source application will not be reflected after running this command and will require re-running the command. Tests packaged docker image. |
| `yarn nx test/unit playnite-web-app`                               | Run Jest-based unit tests.                                                                                                                                                                                                                    |

### Game Assets Processor

| Command                                  | Notes                                                                      |
| :--------------------------------------- | :------------------------------------------------------------------------- |
| `yarn nx start game-assets-processor`    | Starts service.                                                            |
| `yarn nx test/e2e game-assets-processor` | Runs Jest-based e2e tests, found in the `__integration_tests__` directory. |

### Database/schema Changes

Changing the database schema (defined in the [schema.prisma](../../../apps/playnite-web/src/server/data/providers/postgres/schema.prisma) file) will require the changes to be tracked as a database migration. This can be done after changes are made to the schema by running `yarn nx run playnite-web:db/migrate`. All SQL migrations files must then be committed to the repo.

## Playnite Web Plugin Development

To develop the Playnite Web plugin, a Windows machine is required. Playnite must be installed. Recommendation is to use Visual Studio Community edition for development.

1. Install required software
   - Playnite
   - Visual Studio
2. Open the solution file in Visual Studio; located in `apps/PlayniteWebPlugin/src/PlayniteWeb.sln`.
3. Build the solution.
4. Open Playnite and add the path to the bin directory as a local plugin. This setting is found under the Developer section in the settings.
5. Debugging opens Playnite with the plugin installed.
