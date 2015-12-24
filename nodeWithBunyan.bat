@echo off
node %* | "node_modules/.bin/bunyan" -o short