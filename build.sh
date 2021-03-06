#!/bin/bash

# 使用说明:
# ./build.sh  build()编译
# ./build.sh s  上传dist目录下所有文件到szkingdom.vip下发布目录kingchat2.0
# ./build.sh b  先编译再执行上一步

issue=$1
issuePath=root@szkingdom.vip:/root/signalserver/public/kingchat2.0

function build() {
    echo 'npm run build'
    rm -rf dist
    npm run build
    ln -s ../src/main.js dist/ -f
    ln -s ../src/recordLocal.js dist/ -f
    ln -s ../src/recordServer.js dist/ -f
    ln -s ../src/gum.js dist/ -f
    ln -s ../src/shareMp3.js dist/ -f
    ln -s ../index.html dist/ -f
    ln -s ../main.css dist/ -f
    # ln -s ../src/adapter.min.js dist/ -f

    # cp src/* lib/
    # npx babel src --out-file lib/all.js
    # npm run build
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
