#!/bin/sh
set -eu

case "${PORT:-8081}" in
  ''|*[!0-9]*)
    echo "PORT must be a valid numeric port" >&2
    exit 1
    ;;
esac

exec java ${JAVA_OPTS:-} -jar /app/app.jar --server.address=0.0.0.0 --server.port="${PORT:-8081}"
