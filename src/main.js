"use strict";

require("@babel/polyfill");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var btnGum = document.getElementById('gum');
var localVideo = document.getElementById('localVideo'); // const btnShareDesktop = document.getElementById('shareDesktop');

var DEFAULT_CONSTRAINTS = Object.freeze({
  audio: {
    noiseSuppression: true // 降噪
    // autoGainControl: true // 自增益

  },
  video: {
    frameRate: 20
  }
});

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

btnGum.onclick = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
  var stream;
  return _regenerator["default"].wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return gum(DEFAULT_CONSTRAINTS);

        case 2:
          stream = _context2.sent;
          localVideo.srcObject = stream;

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}));