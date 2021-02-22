const btnRecordServer = document.getElementById('recordServer');

function startRecordServer(){
    const mixedStream = roomClient.getMixedStream();
    // videoMixed.srcObject = mixedStream;

    console.log(localstream.getVideoTracks()[0].getSettings());
    console.log(remotestream.getVideoTracks()[0].getSettings());
    console.log(mixedStream.getVideoTracks()[0].getSettings());

    const roomId = '12345678';
    const roomName = 'record';
    let storeCallback = new Object();
    storeCallback.handlerLStreamCallback = handlerLStreamCallback;
    storeCallback.handlerRStreamCallback = handlerRStreamCallback;
    storeCallback.handlerChatDataCallback = handlerChatDataCallback;
    storeCallback.handlerSuccessfulCallback = handlerSuccessfulCallback;
    storeCallback.handlerActionCallback = handlerActionCallback;
    recordClient = new kingchat.RoomClient({
        roomId: roomId,
        displayName: roomName,
        protooUrl: g_protooUrl,
        mixedStream: mixedStream,
        forceTcp: true,
        produce: true,
        consume: false,
        datachannel: false,
        storeCallback: storeCallback
    });
    recordClient.join();
}

function stopRecordServer(){
    console.log('stop record!');
    recordClient.stopRecord((res)=>{
        const getFileName = 'https://pretke.kingwelan.com/file_service/record/'+ res.fileName;

        // videoMixed.src = window.URL.createObjectURL(getFileName);
        videoMixed.srcObject = null;
        videoMixed.src = getFileName;
        videoMixed.controls = true;
        videoMixed.play();
    });
}

btnRecordServer.onclick = async () => {

    if(btnRecordServer.textContent === '服务器录制') {
        btnRecordServer.textContent = '停止';
        startRecordServer();
    }
    else {
        btnRecordServer.textContent = '服务器录制';
        stopRecordServer()
    }
}
