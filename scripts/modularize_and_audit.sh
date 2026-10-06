#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

python - << 'PYEOF'
import os, re, shutil
html_p, css_p, js_p, bak_p = "src/index.html", "src/style.css", "src/script.js", "src/index.html.original"

if not os.path.exists(bak_p):
    shutil.copyfile(html_p, bak_p)
    print(f"[+] Backup saved: {bak_p}")

with open(html_p, "r", encoding="utf-8") as f:
    c = f.read()

st = re.search(r"<style[^>]*>(.*?)</style>", c, re.DOTALL)
if st:
    with open(css_p, "w", encoding="utf-8") as f:
        f.write(st.group(1).strip() + "\n")
    print(f"[+] Extracted CSS ({len(st.group(1).strip())} bytes) -> {css_p}")
    c = c[:st.start()] + '<link rel="stylesheet" href="style.css">' + c[st.end():]

sc = re.search(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", c, re.DOTALL)
if sc:
    with open(js_p, "w", encoding="utf-8") as f:
        f.write(sc.group(1).strip() + "\n")
    print(f"[+] Extracted JS ({len(sc.group(1).strip())} bytes) -> {js_p}")
    c = c[:sc.start()] + '<script src="script.js"></script>' + c[sc.end():]

with open(html_p, "w", encoding="utf-8") as f:
    f.write(c)
print(f"[+] Updated {html_p} with modular links.")
PYEOF

echo "--- JAVASCRIPT SYNTAX CHECK ---"
node --check src/script.js && echo "JavaScript Syntax: OK"

echo "--- CORE FILES AUDIT ---"
for f in src/index.html src/style.css src/script.js scripts/start.sh README.md; do
    if [ -f "$f" ]; then echo "  [OK] $f ($(wc -c < "$f" | tr -d ' ') bytes)"; else echo "  [MISSING] $f"; fi
done
