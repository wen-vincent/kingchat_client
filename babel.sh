#!/bin/sh
# ./node_modules/.bin/babel src/main.js -o tmp/kingwebrtc.js
./node_modules/.bin/babel src/kingwebrtc.js -o tmp/kingwebrtc.js
npx webpack