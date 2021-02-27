#!/bin/bash

issue=$1
issuePath=root@szkingdom.vip:/root/signalserver/public/kingchat2.0

function build() {
    echo 'npm run build'
    # rm -rf dist
    # npm run build
    ln -s ../src/main.js dist/ -f
    ln -s ../src/recordLocal.js dist/ -f
    ln -s ../src/recordServer.js dist/ -f
    ln -s ../src/gum.js dist/ -f
    ln -s ../src/shareMp3.js dist/ -f
    ln -s ../src/adapter.min.js dist/ -f
    ln -s ../index.html dist/ -f
    ln -s ../main.css dist/ -f
}

function updateToServer() {
    echo "scp to $issuePath"
    scp dist/* $issuePath
}

if [ "$issue" == '' ]; then
    build
    # scp  dist/* $issuePath
elif [ "$issue" == 'b' ]; then
    build
    updateToServer
elif [ "$issue" == 's' ]; then
    updateToServer
fi
