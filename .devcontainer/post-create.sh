#!/usr/bin/env bash
set -e

echo -e "{
\"data-root\": \"/var/lib/docker2\"
}" >/etc/docker/daemon.json
/usr/local/share/docker-init.sh

corepack enable
corepack use yarn@^4.5.1

echo 'Ensuring Cypress executable is installed'
{ yarn dlx cypress verify; } || { yarn dlx cypress@13.15.0 install; }

echo 'Ensure correct vscode extensions are installed.'
cat .devcontainer/devcontainer.json |
  jq -c '.customizations.vscode.extensions[]' |
  xargs -L 1 code-server --install-extension
cat .devcontainer/devcontainer.json |
  jq -c '.customizations.vscode.extensions[]' |
  xargs -L 1 code --install-extension
