#!/bin/zsh

set -e

REPO_DIR="/Users/chenglinmacbook/Library/CloudStorage/OneDrive-UniversityofVictoria/Python/Notes/vibe_coding/haul_road"
APP_URL="http://127.0.0.1:5173/"

cd "$REPO_DIR"

if lsof -iTCP:5173 -sTCP:LISTEN >/dev/null 2>&1; then
  open "$APP_URL"
  exit 0
fi

osascript <<'APPLESCRIPT'
tell application "Terminal"
  activate
  do script "cd '/Users/chenglinmacbook/Library/CloudStorage/OneDrive-UniversityofVictoria/Python/Notes/vibe_coding/haul_road' && npm run dev -- --host 127.0.0.1"
end tell
APPLESCRIPT

sleep 3
open "$APP_URL"
