"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var btnRecordServer = document.getElementById('recordServer');

function startRecordServer() {
  var mixedStream = roomClient.getMixedStream(); // videoMixed.srcObject = mixedStream;

  console.log(localstream.getVideoTracks()[0].getSettings());
  console.log(remotestream.getVideoTracks()[0].getSettings());
  console.log(mixedStream.getVideoTracks()[0].getSettings());
  var roomId = '12345678';
  var roomName = 'record';
  var storeCallback = new Object();
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

function stopRecordServer() {
  console.log('stop record!');
  recordClient.stopRecord(function (res) {
    var getFileName = 'https://pretke.kingwelan.com/file_service/record/' + res.fileName; // videoMixed.src = window.URL.createObjectURL(getFileName);

    videoMixed.srcObject = null;
    videoMixed.src = getFileName;
    videoMixed.controls = true;
    videoMixed.play();
  });
}

btnRecordServer.onclick = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (btnRecordServer.textContent === '服务器录制') {
            btnRecordServer.textContent = '停止';
            startRecordServer();
          } else {
            btnRecordServer.textContent = '服务器录制';
            stopRecordServer();
          }

        case 1:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));