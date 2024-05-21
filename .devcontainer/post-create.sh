#!/usr/bin/env bash
set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

corepack enable
corepack prepare --activate yarn@^4.0.0

yarn dlx cypress install

echo -e "{
\"data-root\": \"/var/lib/docker2\"
}" > /etc/docker/daemon.json

