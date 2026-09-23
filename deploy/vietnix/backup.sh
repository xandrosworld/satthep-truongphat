#!/bin/sh
set -eu
umask 077
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
docker compose exec -T app node server/migrate.cjs export /data/truongphat.sqlite "/backups/vps-$stamp.sqlite"
# Keep backups until an off-server copy and retention policy are configured.
