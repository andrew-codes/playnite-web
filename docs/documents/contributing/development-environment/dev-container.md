[**playnite-web-app**](../../../README.md) • **Docs**

***

[playnite-web-app](../../../README.md) / contributing/development-environment/dev-container

# Developer Environment: Code Space/DevContainer

## Required Software

Install the following software on your local machine:

1. [vscode](https://code.visualstudio.com/Download)
2. Dev containers vscode extension, `code --install-extension ms-vscode-remote.remote-containers`
3. XServer (for running Cypress tests).
   - For OSX, recommend: [XQuartz](https://www.bing.com/ck/a?!&&p=c21da4f99329c03fJmltdHM9MTcxODg0MTYwMCZpZ3VpZD0zOTJjZTBlOC1iMzRjLTY3Y2MtMDU4NC1mM2NkYjI2MDY2NjUmaW5zaWQ9NTIyNw&ptn=3&ver=2&hsh=3&fclid=392ce0e8-b34c-67cc-0584-f3cdb2606665&psq=xquartz+&u=a1aHR0cHM6Ly93d3cueHF1YXJ0ei5vcmcv&ntb=1)
   - For Windows, still need a recommendation.
4. Docker
5. [gh CLI](https://github.com/cli/cli)

## Setup X11 Forwarding

### Enable X11 Forwarding for SSH

First, enable X11 forwarding for your SSH configuration by editing `~/.ssh/config`.

```ssh_config
Host *
  ForwardX11 yes
```

### Configuring an XServer

Once an XServer is installed, such as XQuartz, ensure it is configured to Authenticate and Allow connections from network clients. This can be done via the security settings of XQuartz.

Also ensure XQuartz starts at login.

Finally, sign out completely and sign back in.

### Allowing Connections to XServer

Next, allow connections from your host machine's IP address. Here is an example is bash:

```shell
IP=$(ifconfig en0 | grep inet | awk '$1=="inet" {print $2}')

xhost + $IP
# If xhost is not found, try:
/usr/X11/bin/xhost + $IP
```

## Preparing Codebase

1. [Fork the playnite-web repo](https://github.com/andrew-codes/playnite-web/fork)
2. Open the repo in vscode.
3. Ensure docker is running.
4. Open the command palette, type/search for comand `Dev Containers: Rebuild and Reopen container`. Allow the container to be built and started.
5. Once the dev container is running and connected to vscode, run `yarn` in its terminal.
6. Run `yarn nx run playnite-web-app:start`
7. In vscode, forward port 3000. This is likely done automatically or can be done with the `Forward Port` from the command palette.
8. Open [http://localhost:3000](http://localhost:3000).
9. Continue to see [commands](./index.md#running-playnite-web) for additional commands.

## Running Component/E2E Tests

You can run Cypress component and E2E tests from the terminal in the dev container.
