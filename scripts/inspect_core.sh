#!/data/data/com.termux/files/usr/bin/bash
set -e
echo "===== INSPECTING scripts/start.sh ====="
cat scripts/start.sh
echo
echo "===== FIRST 30 LINES OF src/index.html ====="
head -n 30 src/index.html
echo
echo "===== CSS & LOGO REFS IN src/index.html ====="
grep -n -E "(<style|<link.*stylesheet|Saedy_Dental_Logo|\.svg)" src/index.html | head -n 15
echo
echo "===== LAST 30 LINES OF src/index.html ====="
tail -n 30 src/index.html
