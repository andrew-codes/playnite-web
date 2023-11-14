#!/usr/bin/env bash
set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

corepack enable
corepack prepare --activate yarn@^4.0.0
