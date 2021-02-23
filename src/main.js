// require("babel-core/register");
require("@babel/polyfill");

// import adapter from 'webrtc-adapter';
// const adapter = require('webrtc-adapter');
// console.log(adapter.browserDetails.browser);
// console.log(adapter.browserDetails.version);

const btnGum = document.getElementById('gum');
const localVideo = document.getElementById('localVideo');
// const btnShareDesktop = document.getElementById('shareDesktop');
const DEFAULT_CONSTRAINTS = Object.freeze({
    audio: {
        noiseSuppression: true // 降噪
        // autoGainControl: true // 自增益
    },
    video: true
});


const gum = async (constraints) => {
    return new Promise(function (s, j) {
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            s(stream);
        }).catch(function (err) {
            j(err);
        })
    });
};

btnGum.onclick = async ()=> {
    let stream = await gum(DEFAULT_CONSTRAINTS);
    localVideo.srcObject = stream;
}
