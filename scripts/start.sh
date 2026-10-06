#!/data/data/com.termux/files/usr/bin/bash

cd "$(dirname "$0")/.."

echo "=============================================="
echo " ALSSAEDY CLINIC — RECEIPT VOUCHER"
echo "=============================================="
echo
echo "Project: $(pwd)"
echo
echo "Open this file in your Android browser:"
echo
echo "file://$(pwd)/src/index.html"
echo
echo "Or start a local server:"
echo
echo "http://127.0.0.1:8080"
echo
echo "Press CTRL+C to stop the server."
echo

python -m http.server 8080 --directory .
