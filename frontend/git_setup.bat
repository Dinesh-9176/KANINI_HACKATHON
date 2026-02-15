@echo off
git init
git remote remove origin
git remote add origin https://github.com/Dinesh-9176/KANINI_HACKATHON.git
git add .
git commit -m "Initial commit of Hospital Dashboard"
git branch -M main
git push -u origin main
