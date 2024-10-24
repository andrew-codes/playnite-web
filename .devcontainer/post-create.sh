#!/usr/bin/env bash
set -e

/usr/local/share/docker-init.sh

corepack enable
corepack use yarn
yarn set version 4.5.1

echo 'Ensuring Cypress executable is installed'
{ yarn dlx cypress verify; } || { yarn dlx cypress@13.15.0 install; }

git config --global --add safe.directory /workspaces/playnite-web
