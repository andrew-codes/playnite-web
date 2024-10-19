#!/usr/bin/env bash
set -e

echo -e "{
\"data-root\": \"/var/lib/docker2\"
}" >/etc/docker/daemon.json
/usr/local/share/docker-init.sh

corepack enable
corepack use yarn@^4.5.1
