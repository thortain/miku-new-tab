#!/bin/bash
# Miku New Tab — watched build
# Run: bash /mnt/u/Lucrecia/miku-newtab/watch-build.sh
# Then reload the XPI in about:debugging

SOURCE="/mnt/u/Lucrecia/miku-newtab/extension"
OUTPUT="/mnt/u/Lucrecia/miku-newtab/web-ext-artifacts/miku-newtab.xpi"
LOCK="/tmp/miku-watch.lock"

echo "👁‍🗨 Watching $SOURCE for changes..."
echo "📦 Auto-building to $OUTPUT"
echo "🔄 Reload the XPI in about:debugging after each build"
echo ""

while true; do
  CHANGE=$(inotifywait -q -e modify,move,create,delete -r "$SOURCE" 2>/dev/null)
  if [[ -f "$LOCK" ]]; then
    continue
  fi

  touch "$LOCK"
  echo ""
  echo "🔨 [$(date '+%H:%M:%S')] Change detected — rebuilding..."
  cd /mnt/u/Lucrecia/miku-newtab
  npx web-ext build --source-dir extension --filename miku-newtab.xpi --overwrite 2>&1 | tail -3

  if [[ -f "$OUTPUT" ]]; then
    echo "✅ Done! → $OUTPUT"
  else
    echo "❌ Build failed"
  fi
  echo ""

  rm -f "$LOCK"
done
