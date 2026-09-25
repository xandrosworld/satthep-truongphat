#!/bin/sh
# Isolated recovery/load rehearsal; does not stop or write the production application.
set -eu
umask 077
cd /opt/truongphat/deploy/vietnix
stamp=$(date -u +%Y%m%dT%H%M%SZ)
drill=/srv/truongphat/rehearsals/$stamp
mkdir -p "$drill"
image=$(docker inspect truongphat-app-1 --format '{{.Config.Image}}')
image_id=$(docker inspect truongphat-app-1 --format '{{.Image}}')
docker compose exec -T app node server/migrate.cjs export /data/truongphat.sqlite "/backups/drill-$stamp.sqlite" > "$drill/export.json"
cp "/srv/truongphat/backups/drill-$stamp.sqlite" "$drill/source.sqlite"
cp "/srv/truongphat/backups/drill-$stamp.sqlite.manifest.json" "$drill/source.sqlite.manifest.json"
tar -czf "$drill/config.tar.gz" .env compose.yaml Caddyfile backup.sh
docker save "$image" -o "$drill/application-image.tar"
sha256sum "$drill/config.tar.gz" "$drill/application-image.tar" > "$drill/bundle.sha256"
sha256sum -c "$drill/bundle.sha256"
mkdir "$drill/config"
tar -xzf "$drill/config.tar.gz" -C "$drill/config"
docker compose --project-directory "$drill/config" -f "$drill/config/compose.yaml" config --quiet
docker load -i "$drill/application-image.tar" > "$drill/image-load.log"
test "$(docker image inspect "$image" --format '{{.Id}}')" = "$image_id"
cp /opt/truongphat/tools/rehearse-recovery.cjs /opt/truongphat/tools/load-rehearsal.cjs "$drill/"
docker run --rm --network none --cpus=0.5 --memory=768m --pids-limit=128 \
 --name "tp-recovery-$stamp" --env-file "$drill/config/.env" -e TP_APP_ROOT=/app \
 -v "$drill:/drill" "$image" node /drill/rehearse-recovery.cjs /drill/source.sqlite /drill/restored > "$drill/recovery.json"
docker run --rm --network none --cpus=0.5 --memory=768m --pids-limit=128 \
 --name "tp-load-$stamp" -e TP_APP_ROOT=/app -e TP_LOAD_REPORT=/drill/load.json \
 -v "$drill:/drill" "$image" node /drill/load-rehearsal.cjs > "$drill/load.log"
printf 'Rehearsal artifacts (restricted): %s\n' "$drill"
cat "$drill/recovery.json"
cat "$drill/load.json"
docker inspect truongphat-app-1 --format 'Production health: {{.State.Health.Status}}'
