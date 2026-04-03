#!/usr/bin/env python3
"""
Miku New Tab — watched build script
Run: python3 watch_build.py
Any .html/.css/.js change in extension/ auto-rebuilds the XPI.
Then just reload the XPI in about:debugging.
"""
import subprocess
import time
import os
from pathlib import Path

SOURCE = Path("/mnt/u/Lucrecia/miku-newtab/extension")
OUTPUT = Path("/mnt/u/Lucrecia/miku-newtab/web-ext-artifacts/miku-newtab.xpi")
LOCK   = Path("/tmp/miku-watch.lock")
BUILD_CMD = ["npx", "web-ext", "build", "--source-dir", "extension",
             "--filename", "miku-newtab.xpi", "-o"]

EXTENSIONS = {".html", ".css", ".js", ".json", ".png", ".svg", ".ico", ".txt"}

def get_mtimes():
    return {f: f.stat().st_mtime for f in SOURCE.rglob("*") if f.is_file() and f.suffix in EXTENSIONS}

def build():
    print(f"\n🔨 [{time.strftime('%H:%M:%S')}] Change detected — rebuilding...")
    result = subprocess.run(
        BUILD_CMD, cwd="/mnt/u/Lucrecia/miku-newtab",
        capture_output=True, text=True
    )
    output_lines = result.stdout.strip().split("\n")[-3:]
    for line in output_lines:
        print("  " + line)
    if OUTPUT.exists():
        print(f"✅ Done! → {OUTPUT}")
    else:
        print("❌ Build failed")

def main():
    print("👁‍🗨 Miku New Tab — watched build")
    print(f"   Watching: {SOURCE}")
    print(f"   Output:   {OUTPUT}")
    print("   → Save any file, then reload the XPI in about:debugging\n")

    last = get_mtimes()
    while True:
        time.sleep(1)
        if LOCK.exists():
            continue
        current = get_mtimes()
        changed = [f for f in current if current[f] != last.get(f)]
        if changed:
            last = current
            build()
        else:
            # Check for new/deleted files too
            if set(current.keys()) != set(last.keys()):
                last = current
                build()

if __name__ == "__main__":
    main()
