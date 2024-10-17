# Developer Environment: Codespace

## Required Software

Install the following software on your local machine:

1. [vscode](https://code.visualstudio.com/Download)
2. XServer (for running Cypress tests in codespace).
   - For OSX, recommend: [XQuartz](https://www.bing.com/ck/a?!&&p=c21da4f99329c03fJmltdHM9MTcxODg0MTYwMCZpZ3VpZD0zOTJjZTBlOC1iMzRjLTY3Y2MtMDU4NC1mM2NkYjI2MDY2NjUmaW5zaWQ9NTIyNw&ptn=3&ver=2&hsh=3&fclid=392ce0e8-b34c-67cc-0584-f3cdb2606665&psq=xquartz+&u=a1aHR0cHM6Ly93d3cueHF1YXJ0ei5vcmcv&ntb=1)
   - For Windows, still need a recommendation.

## Preparing Codebase

1. [Fork the playnite-web repo](https://github.com/andrew-codes/playnite-web/fork)
2. Ensure your XServer application is running on local machine.
   - Ensure your XServer is configured to Authenticate and Allow Connections from network clients
3. Start a codespace and open in vscode.
4. Run `yarn`
5. Run `yarn run start`
6. In vscode, forward port 3000. This can be found in same pane as the terminal.
7. Open [http://localhost:3000](http://localhost:3000).
8. Continue to see [commands](./index.md#running-playnite-web) for running tests.
