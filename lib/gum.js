const DEFAULT_CONSTRAINTS = Object.freeze({
    audio: {
        noiseSuppression: true // 降噪
        // autoGainControl: true // 自增益
    },
    video: {
        frameRate: 20
    }
});

const makeConstraints = (width,height,deviceId) => {
    let constraints = {};
    let audio = {};
    let video = {};
    if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
        console.log('the getSupportedConstraints is not supported!');
        audio = true;
        video = true;
    }
    else {
        let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
        // add audio constraints
        // console.log(supportedConstraints);
        if (supportedConstraints.noiseSuppression) {
            audio.noiseSuppression = true;
        }
        if (supportedConstraints.autoGainControl) {
            // audio.autoGainControl = true; 
        }
        if (supportedConstraints.echoCancellation) {
            audio.echoCancellation = true;  
        }

        // add video constraints
        // idea 会匹配最佳分辨率
        if (supportedConstraints.width) { // 部分机型width,height为true任然不能设值
            video.width = { ideal: width}; // 2k 2580
        }
        if (supportedConstraints.height) {
            video.height = { ideal: height}; // 2k 1920
        }
        if (supportedConstraints.facingMode) {
            video.facingMode = { ideal: 'user' }; // 前置/后置摄像头 user/environment
        }
        if (supportedConstraints.frameRate) {
            video.frameRate = 20; // 帧率
        }
        if (supportedConstraints.deviceId) {
            video.deviceId = deviceId ? {exact:deviceId} : undefined
        }
    }
    constraints.audio = audio;
    constraints.video = video;
    return constraints;
}

const gum = async (constraints) => {
    return new Promise(function (s, j) {
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            s(stream);
        }).catch(function (err) {
            j(err);
        })
    });
};

const gud = async () => {
    return new Promise(function (d, j) {
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
            d(devices);
        }).catch(function (err) {
            j(err);
        })
    });
};

const normalVideoRenderHandler =  (stream, textToDisplay, callback) => {
    // on-video-render:
    // called as soon as this video stream is drawn (painted or recorded) on canvas2d surface
    stream.onRender = function(context, x, y, width, height, idx, ignoreCB) {
        if(!ignoreCB && callback) {
            callback(context, x, y, width, height, idx, textToDisplay);
            return;
        }

        context.font = '30px Georgia';
        var measuredTextWidth = parseInt(context.measureText(textToDisplay).width);
        x = 10;
        y = (context.canvas.height - height) + 20;
        var gradient = context.createLinearGradient(0, 0, width , 0);
        gradient.addColorStop('0', 'magenta');
        gradient.addColorStop('0.5', 'blue');
        gradient.addColorStop('1.0', 'red');
        context.fillStyle = gradient;

        textToDisplay.forEach((item,index,array) => {
            context.fillText(item, x, y+index*30);
        });
    }
}

// module.exports = {gum,gud,normalVideoRenderHandler};