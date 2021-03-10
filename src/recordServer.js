const btnRecordServer = document.getElementById('recordServer');


const handlerRecordSuccessfulCallback = (msg) => {
    console.log('handlerRecordSuccessfulCallback', msg);
}

const handlerRecordActionCallback = (msg) => {
    console.log('handlerRecordActionCallback', msg);
}

async function startRecordServer(stream) {
    // const mixedStream = roomClient.getMixedStream();

    const roomId = '123456789';
    const roomName = 'record';
    let storeCallback = new Object();
    storeCallback.handlerSuccessfulCallback = handlerRecordSuccessfulCallback;
    storeCallback.handlerActionCallback = handlerRecordActionCallback;
    if (recordClient) {
        recordClient.close();
    }
    recordClient = new kingchat.RoomClient({
        roomId: roomId,
        displayName: roomName,
        protooUrl: g_protooUrl,
        forceTcp: true,
        produce: true,
        consume: false,
        datachannel: false,
        storeCallback: storeCallback
    });
    await recordClient.join((connectMsg) => {

        if (connectMsg.action === 'succ') {
            console.log('start produce');
            recordClient._startProduce(stream, (recordMsg) => {
                console.log('start record', recordMsg);
                recordClient.startRecord((recordMsg) => {
                    console.log('start record', recordMsg);
                },true,);
            });
        }
    });
}

function stopRecordServer() {
    console.log('stop record!');
    recordClient.stopRecord((res) => {
        const getFileName = 'https://pretke.kingwelan.com/file_service/record/' + res.fileName;
        console.log(getFileName);

        // videoMixed.src = window.URL.createObjectURL(getFileName);
        videoMixed.srcObject = null;
        videoMixed.oncanplay = () => {
            videoMixed.play();
        }
        videoMixed.src = getFileName;
        videoMixed.controls = true;

        recordClient.close();
        recordClient = null;
    });
}

btnRecordServer.onclick = async () => {
    if (btnRecordServer.textContent === '服务器录制') {
        btnRecordServer.textContent = '停止';
        let stream = roomClient.getMixedStream();
        startRecordServer(stream);
    }
    else {
        btnRecordServer.textContent = '服务器录制';
        stopRecordServer()
    }
}

const btnRecordServerSingle = document.getElementById('recordServerSingle');
btnRecordServerSingle.onclick = async () => {
    if (btnRecordServerSingle.textContent === '服务器录制单向') {
        let stream = await getLocalStream();
        videoLocal.oncanplay = () => {
            videoLocal.play();
        };
        videoLocal.srcObject = stream;
        startRecordServer(stream);
        btnRecordServerSingle.textContent = '结束';
    }
    else {
        stopRecordServer();
        btnRecordServerSingle.textContent = '服务器录制单向';
    }
}