var roomClient = null; // 双向视频接口
var recordClient = null; // 录制视频接口
var localStream = null;  // 自己的视频流
var remoteStream = null; // 对端的视频流

// 按钮
const btnMakeCall = document.getElementById('makeCall');
const btnHangup = document.getElementById('hangup');
const btnSendMsg = document.getElementById('sendMsg');
const btnShareDesktop = document.getElementById('shareDesktop');
const btnMixDesktop = document.getElementById('mixDesktop');
const btnShareMp3 = document.getElementById('shareMp3');

// 视频控件
const videoLocal = document.getElementById('localVideo');
const videoRemote = document.getElementById('remoteVideo');
const videoMixed = document.getElementById('mixedVideo');

// 可选配置的变量
const g_roomName = 'name';
// const g_roomId = '12345611';
const g_videoWidth = 640;
const g_videoHeight = 480;
// const g_protooUrl = "wss://szt.szkingdom.vip:4443/";
// const g_protooUrl = "wss://s1.chinalin.com:4443";
const g_protooUrl = "wss://inward.szkingdom.vip:4443/";

// utils
const showStreamRatio = (stream) => {
    let videoTrack = stream.getVideoTracks()[0];
    let videoSetting = videoTrack.getSettings();
    let height = videoSetting.height;
    let width = videoSetting.width;
    console.log("stream width height is: ", width, height);
}

const getMediaDevices = async () => {
    let devices;
    try {
        devices = await gud();
    } catch (error) {
        console.error(error);
    }
    return devices;
}

const getLocalStream = async () => {
    let devices = await getMediaDevices();
    devices.forEach(element => {
        // console.log(element);
    });

    let deviceId ;
    devices.forEach( (device) => {
        if(device.kind.toLowerCase() == "videoinput") {
            // console.log(device);
            deviceId = device.deviceId; // 指定摄像头
        }
    });

    // deviceId = '6f26c52bec302cadaac81be87d1a5f0fdda3c2dda4b6e2f2df60d4f5ea3eda0e';
    let stream;
    try {
        // const constraints = makeConstraints(g_videoWidth,g_videoHeight,deviceId);
        const constraints = makeConstraints(g_videoWidth,g_videoHeight);
        stream = await gum(constraints);
    } catch (err) {
        // console.error(err);
        alert(DEFAULT_CONSTRAINTS);
        stream = await gum(DEFAULT_CONSTRAINTS); // 使用默认值
    }

    // TODO:强制分辨率
    // if(stream)

    return stream;
}

const handlerRStreamCallback = (remoteStream) => {
    remoteStream = remoteStream;
    videoRemote.srcObject = remoteStream;

    btnHangup.disabled = false;
    btnShareDesktop.disabled = false;
    btnMixDesktop.disabled = false;
    btnShareMp3.disabled = false;

    btnRecordServer.disabled = false;
    btnRecordLocal.disabled = false;

    console.log('get remotestream');
    // showStreamRatio(remotestream);
}

const handlerChatDataCallback = (msg) => {
    const debugTextArea = document.getElementById("recvMsg");
    debugTextArea.value += 'recv:' + msg + '\n';
    debugTextArea.scrollTop = debugTextArea.scrollHeight;
}

const handlerErrorCallback = (err) => {
    console.error(err);
}

const handlerSuccessfulCallback = (msg) => {
    console.log(msg);
}

const handlerActionCallback = (msg) => { // 对方连接断开指令
    console.log(msg);
    if (msg.action === 'other-disconnect') {
        roomClient.close();
        videoLocal.srcObject = null;
        videoRemote.srcObject = null;

        btnMakeCall.disabled = false;
        btnHangup.disabled = true;
        btnShareDesktop.disabled = true;
        btnMixDesktop.disabled = true;
        btnShareMp3.disabled = true;

        btnRecordLocal.disabled = true;
        btnRecordServer.disabled = true;
    }
}

// 按钮事件
btnMakeCall.onclick = async () => {
    localStream = await getLocalStream();
    videoLocal.srcObject = localStream;

    // btnMakeCall.disabled = true;
    // btnHangup.disabled = false;
    let storeCallback = new Object();
    storeCallback.handlerRStreamCallback = handlerRStreamCallback;
    storeCallback.handlerChatDataCallback = handlerChatDataCallback;
    storeCallback.handlerSuccessfulCallback = handlerSuccessfulCallback;
    storeCallback.handlerActionCallback = handlerActionCallback;

    if (roomClient) {
        roomClient.close();
        roomClient = null;
    }

    let roomId = document.getElementById('roomid').value;
    roomClient = new kingchat.RoomClient({
        roomId: roomId,
        displayName: g_roomName,
        localStream: localStream,
        protooUrl: g_protooUrl,
        useSimulcast: false,
        useSharingSimulcast: false,
        forceTcp: false,
        produce: true,
        consume: true,
        forceH264: false,
        forceVP9: false,
        svc: false,
        datachannel: true,
        storeCallback: storeCallback
    });

    await roomClient.join();
}

btnHangup.onclick = async () => {

    btnRecordServer.disabled = true;
    btnRecordLocal.disabled = true;

    btnMakeCall.disabled = false;
    btnHangup.disabled = true;
    btnShareDesktop.disabled = true;
    btnMixDesktop.disabled = true;
    btnShareMp3.disabled = true;
    btnDownload.disabled = true;

    roomClient.close();
    roomClient = null;
}

btnSendMsg.onclick = () => {
    const text = document.getElementById("inputMsg").value;
    console.debug("发送文本消息: %s", text);
    roomClient.sendChatMessage(text);

    const debugTextArea = document.getElementById("recvMsg");
    debugTextArea.value += 'send:' + text + '\n';
    debugTextArea.scrollTop = debugTextArea.scrollHeight;
}

btnShareDesktop.onclick = async () => {
    if (btnShareDesktop.textContent === '分享桌面') {
        roomClient.enableShareDesktop();
        btnShareDesktop.textContent = '结束分享';
    }
    else {
        roomClient.enableWebcam();
        btnShareDesktop.textContent = '分享桌面';
    }
}

btnMixDesktop.onclick = async () => {
    // roomClient.enableShareAndMix();
}

btnShareMp3.onclick = async () => {
    // roomClient.enableShareMp3();
    getMp3Stream((track, duration) => {
        roomClient.disableMic();
        roomClient.enableShareMp3(track, duration);
    });
}