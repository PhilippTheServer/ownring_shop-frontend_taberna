#!/usr/bin/env bash
# Usage: shoot.sh <view> <size> <out.png>
set -euo pipefail
dir=$(cd "$(dirname "$0")" && pwd)
google-chrome --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader \
  --allow-file-access-from-files --virtual-time-budget=30000 --window-size="$2,$2" \
  --dump-dom "file://$dir/render.html?view=$1&size=$2" 2>/dev/null \
  | python3 -c '
import sys, re, base64
m = re.search(r"DATA:data:image/png;base64,([A-Za-z0-9+/=]+):END", sys.stdin.read())
if not m: sys.exit("no image in DOM")
open(sys.argv[1], "wb").write(base64.b64decode(m.group(1)))' "$3"
