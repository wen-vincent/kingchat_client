"use strict";

var mediaRecorder;
var buffer;
var btnRecordLocal = document.getElementById('recordLocal');
var btnDownload = document.getElementById('downloadLocal');

function handleDataAvailable(e) {
  console.log("handleDataAvailable");

  if (e && e.data && e.data.size > 0) {
    buffer.push(e.data);
  }
}

function handleDataStop(e) {
  console.log("handleDataStop", e); // var blob = new Blob(buffer, { type: 'video/webm' });
  // videoMixed.src = window.URL.createObjectURL(blob);
  // videoMixed.srcObject = null;
  // videoMixed.controls = true;
  // videoMixed.play();
}

function startRecordLocal() {
  console.log('startRecord');
  buffer = [];
  var mixedStream = roomClient.getMixedStream();
  showStreamRatio(mixedStream);
  videoMixed.srcObject = mixedStream;
  var options = {
    mimeType: 'video/webm;codecs=vp8'
  };

  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error("".concat(options.mimeType, " is not supported!"));
    return;
  }

  try {
    mediaRecorder = new MediaRecorder(mixedStream, options);
  } catch (e) {
    console.error('Failed to create MediaRecorder:', e);
    return;
  }

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleDataStop;
  mediaRecorder.start(500);
}

function stopRecordLocal() {
  mediaRecorder.stop();
}

btnRecordLocal.onclick = function () {
  if (btnRecordLocal.textContent === '本地录制') {
    startRecordLocal();
    btnRecordLocal.textContent = '结束';
    btnDownload.disabled = true;
  } else {
    stopRecordLocal();
    btnRecordLocal.textContent = '本地录制';
    btnDownload.disabled = false;
  }
};

btnDownload.onclick = function () {
  var blob = new Blob(buffer, {
    type: 'video/webm'
  });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.style.display = 'none';
  a.download = 'aaa.webm';
  a.click();
};