#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
client_output="$repo_root/lib/api-client-react/src/generated"
zod_output="$repo_root/lib/api-zod/src/generated"
snapshot="$(mktemp -d)"

restore_outputs() {
  rm -rf "$client_output" "$zod_output"

  if [[ -d "$snapshot/api-client-react" ]]; then
    cp -a "$snapshot/api-client-react" "$client_output"
  fi

  if [[ -d "$snapshot/api-zod" ]]; then
    cp -a "$snapshot/api-zod" "$zod_output"
  fi

  rm -rf "$snapshot"
}

trap restore_outputs EXIT

if [[ -d "$client_output" ]]; then
  cp -a "$client_output" "$snapshot/api-client-react"
fi

if [[ -d "$zod_output" ]]; then
  cp -a "$zod_output" "$snapshot/api-zod"
fi

pnpm exec orval --config ./orval.config.ts

generated_status="$(
  git -C "$repo_root" status --porcelain --untracked-files=all -- \
    lib/api-client-react/src/generated \
    lib/api-zod/src/generated
)"

if [[ -n "$generated_status" ]]; then
  echo >&2
  echo "OpenAPI generated files are stale:" >&2
  echo "$generated_status" >&2
  echo >&2
  echo "Run 'pnpm --filter @workspace/api-spec run codegen' and commit the generated changes." >&2
  exit 1
fi

echo "OpenAPI generated files are up to date."