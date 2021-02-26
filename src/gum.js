"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// const btnGum = document.getElementById('gum');
// const btnShareDesktop = document.getElementById('shareDesktop');
var DEFAULT_CONSTRAINTS = Object.freeze({
  audio: {
    noiseSuppression: true // 降噪
    // autoGainControl: true // 自增益

  },
  video: {
    frameRate: 20
  }
});

var makeConstraints = function makeConstraints(width, height, deviceId) {
  var constraints = {};
  var audio = {};
  var video = {};

  if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
    console.log('the getSupportedConstraints is not supported!');
    audio = true;
    video = true;
  } else {
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints(); // add audio constraints
    // console.log(supportedConstraints);

    if (supportedConstraints.noiseSuppression) {
      audio.noiseSuppression = true;
    }

    if (supportedConstraints.autoGainControl) {// audio.autoGainControl = true; 
    } // add video constraints
    // idea 会匹配最佳分辨率


    if (supportedConstraints.width) {
      // 部分机型width,height为true任然不能设值
      video.width = {
        ideal: width
      }; // 2k 2580
    }

    if (supportedConstraints.height) {
      video.height = {
        ideal: height
      }; // 2k 1920
    }

    if (supportedConstraints.facingMode) {
      video.facingMode = {
        ideal: 'user'
      }; // 前置/后置摄像头 user/environment
    }

    if (supportedConstraints.frameRate) {
      video.frameRate = 20; // 帧率
    }

    if (supportedConstraints.deviceId) {
      video.deviceId = deviceId ? {
        exact: deviceId
      } : undefined;
    }
  }

  constraints.audio = audio;
  constraints.video = video;
  return constraints;
};

var gum = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(constraints) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (s, j) {
              navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                s(stream);
              })["catch"](function (err) {
                j(err);
              });
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function gum(_x) {
    return _ref.apply(this, arguments);
  };
}();

var gud = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (d, j) {
              navigator.mediaDevices.enumerateDevices().then(function (devices) {
                d(devices);
              })["catch"](function (err) {
                j(err);
              });
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function gud() {
    return _ref2.apply(this, arguments);
  };
}();

var normalVideoRenderHandler = function normalVideoRenderHandler(stream, textToDisplay, callback) {
  // on-video-render:
  // called as soon as this video stream is drawn (painted or recorded) on canvas2d surface
  stream.onRender = function (context, x, y, width, height, idx, ignoreCB) {
    if (!ignoreCB && callback) {
      callback(context, x, y, width, height, idx, textToDisplay);
      return;
    }

    context.font = '30px Georgia';
    var measuredTextWidth = parseInt(context.measureText(textToDisplay).width);
    x = 10;
    y = context.canvas.height - height + 20;
    var gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop('0', 'magenta');
    gradient.addColorStop('0.5', 'blue');
    gradient.addColorStop('1.0', 'red');
    context.fillStyle = gradient;
    textToDisplay.forEach(function (item, index, array) {
      context.fillText(item, x, y + index * 30);
    });
  };
};