"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _debug = _interopRequireDefault(require("debug"));

var APP_NAME = '[kingchat2.0.1]';

var Logger = /*#__PURE__*/function () {
  function Logger(prefix) {
    (0, _classCallCheck2.default)(this, Logger);

    if (prefix) {
      this._debug = (0, _debug.default)(`${APP_NAME}:${prefix}`);
      this._warn = (0, _debug.default)(`${APP_NAME}:WARN:${prefix}`);
      this._error = (0, _debug.default)(`${APP_NAME}:ERROR:${prefix}`);
    } else {
      this._debug = (0, _debug.default)(APP_NAME);
      this._warn = (0, _debug.default)(`${APP_NAME}:WARN`);
      this._error = (0, _debug.default)(`${APP_NAME}:ERROR`);
    }
    /* eslint-disable no-console */


    this._debug.log = console.info.bind(console);
    this._warn.log = console.warn.bind(console);
    this._error.log = console.error.bind(console);
    /* eslint-enable no-console */
  }

  (0, _createClass2.default)(Logger, [{
    key: "debug",
    get: function get() {
      return this._debug;
    }
  }, {
    key: "warn",
    get: function get() {
      return this._warn;
    }
  }, {
    key: "error",
    get: function get() {
      return this._error;
    }
  }]);
  return Logger;
}();

exports.default = Logger;
"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RoomClient = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _protooClient = _interopRequireDefault(require("protoo-client"));

var mediasoupClient = _interopRequireWildcard3(require("mediasoup-client"));

var _deviceInfo = _interopRequireDefault(require("./deviceInfo"));

var _multistreamsmixer = _interopRequireDefault(require("multistreamsmixer"));

var _randomString = _interopRequireDefault(require("random-string"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

Promise.resolve().then(function () {
  return (0, _interopRequireWildcard2.default)(require('@babel/polyfill'));
});
Promise.resolve().then(function () {
  return (0, _interopRequireWildcard2.default)(require('adapterjs'));
}); // import('../node_modules/adapterjs/publish/adapter.screenshare.min')

// import { gum, gud, normalVideoRenderHandler } from './gum';
var VIDEO_CONSTRAINS = {
  qvga: {
    width: {
      ideal: 320
    },
    height: {
      ideal: 240
    }
  },
  vga: {
    width: {
      ideal: 640
    },
    height: {
      ideal: 480
    }
  },
  hd: {
    width: {
      ideal: 1280
    },
    height: {
      ideal: 720
    }
  }
};
var PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{
    googDscp: true
  }]
}; // Used for simulcast webcam video.
// const WEBCAM_SIMULCAST_ENCODINGS =
// 	[
// 		{ scaleResolutionDownBy: 4, maxBitrate: 500000 },
// 		{ scaleResolutionDownBy: 2, maxBitrate: 1000000 },
// 		{ scaleResolutionDownBy: 1, maxBitrate: 5000000 }
// 	];

var WEBCAM_SIMULCAST_ENCODINGS = [// { scaleResolutionDownBy: 4, maxBitrate: 500000 },
// { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
{
  scaleResolutionDownBy: 1,
  maxBitrate: 500000
}]; // Used for VP9 webcam video.

var WEBCAM_KSVC_ENCODINGS = [{
  scalabilityMode: 'S3T3_KEY'
}]; // Used for simulcast screen sharing.

var SCREEN_SHARING_SIMULCAST_ENCODINGS = [{
  dtx: true,
  maxBitrate: 1500000
}, {
  dtx: true,
  maxBitrate: 6000000
}]; // Used for VP9 screen sharing.

var SCREEN_SHARING_SVC_ENCODINGS = [{
  scalabilityMode: 'S3T3',
  dtx: true
}]; // const logger = new Logger('RoomClient');

var RoomClient = /*#__PURE__*/function () {
  function RoomClient(_ref) {
    var roomId = _ref.roomId,
        videoWidth = _ref.videoWidth,
        videoHeight = _ref.videoHeight,
        localStream = _ref.localStream,
        displayName = _ref.displayName,
        handlerName = _ref.handlerName,
        useSimulcast = _ref.useSimulcast,
        useSharingSimulcast = _ref.useSharingSimulcast,
        forceTcp = _ref.forceTcp,
        produce = _ref.produce,
        consume = _ref.consume,
        forceH264 = _ref.forceH264,
        forceVP9 = _ref.forceVP9,
        svc = _ref.svc,
        datachannel = _ref.datachannel,
        protooUrl = _ref.protooUrl,
        storeCallback = _ref.storeCallback,
        mixedStream = _ref.mixedStream;
    (0, _classCallCheck2.default)(this, RoomClient);
    this._device = (0, _deviceInfo.default)();
    var peerId = (0, _randomString.default)({
      length: 16
    }).toLowerCase();
    console.debug('constructor() [roomId:"%s", peerId:"%s", displayName:"%s", device:%s]', roomId, peerId, displayName, this._device.flag); // Closed flag.
    // @type {Boolean}

    this._closed = false;
    this.roomId = roomId; // Display name.
    // @type {String}

    this._displayName = displayName; // Whether we want to force RTC over TCP.
    // @type {Boolean}

    this._forceTcp = forceTcp; // Whether we want to produce audio/video.
    // @type {Boolean}

    this._produce = produce; // Whether we should consume.
    // @type {Boolean}

    this._consume = consume; // Whether we want DataChannels.
    // @type {Boolean}

    this._useDataChannel = datachannel; // Force H264 codec for sending.

    this._forceH264 = Boolean(forceH264); // Force VP9 codec for sending.

    this._forceVP9 = Boolean(forceVP9); // Next expected dataChannel test number.
    // @type {Number}

    this._nextDataChannelTestNumber = 0; // Custom mediasoup-client handler name (to override default browser
    // detection if desired).
    // @type {String}

    this._handlerName = handlerName; // Whether simulcast should be used.
    // @type {Boolean}

    this._useSimulcast = useSimulcast; // Whether simulcast should be used in desktop sharing.
    // @type {Boolean}

    this._useSharingSimulcast = useSharingSimulcast; // Protoo URL.
    // @type {String}

    this._protooUrl = protooUrl + "?roomId=" + roomId + "&peerId=" + peerId; // protoo-client Peer instance.
    // @type {protooClient.Peer}

    this._protoo = null; // mediasoup-client Device instance.
    // @type {mediasoupClient.Device}

    this._mediasoupDevice = null; // mediasoup Transport for sending.
    // @type {mediasoupClient.Transport}

    this._sendTransport = null; // mediasoup Transport for receiving.
    // @type {mediasoupClient.Transport}

    this._recvTransport = null; // Local mic mediasoup Producer.
    // @type {mediasoupClient.Producer}

    this._micProducer = null; // Local webcam mediasoup Producer.
    // @type {mediasoupClient.Producer}

    this._webcamProducer = null; // Local share mediasoup Producer.
    // @type {mediasoupClient.Producer}

    this._shareProducer = null; // Local chat DataProducer.
    // @type {mediasoupClient.DataProducer}

    this._chatDataProducer = null; // Local bot DataProducer.
    // @type {mediasoupClient.DataProducer}

    this._botDataProducer = null; // mediasoup Consumers.
    // @type {Map<String, mediasoupClient.Consumer>}

    this._consumers = new Map(); // mediasoup DataConsumers.
    // @type {Map<String, mediasoupClient.DataConsumer>}

    this._dataConsumers = new Map(); // Map of webcam MediaDeviceInfos indexed by deviceId.
    // @type {Map<String, MediaDeviceInfos>}

    this._webcams = new Map(); // Local Webcam.
    // @type {Object} with:
    // - {MediaDeviceInfo} [device]
    // - {String} [resolution] - 'qvga' / 'vga' / 'hd'.

    this.video_constrains = {
      width: {
        ideal: videoWidth
      },
      height: {
        ideal: videoHeight
      }
    };
    this._webcam = {
      device: null,
      VIDEO_CONSTRAINS: 'hd'
    };
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
    this.localStream = localStream;
    this.remoteStream = null;
    this.mixer = null;
    this.getRemoteStream = storeCallback.handlerRStreamCallback;
    this.errorCallback = storeCallback.handlerErrorCallback;
    this.onChatData = storeCallback.handlerChatDataCallback;
    this.handlerSuccessfulCallback = storeCallback.handlerSuccessfulCallback;
    this.handlerActionCallback = storeCallback.handlerActionCallback;
    this.mixedStream = mixedStream; // Set custom SVC scalability mode.

    if (svc) {
      WEBCAM_KSVC_ENCODINGS[0].scalabilityMode = `${svc}_KEY`;
      SCREEN_SHARING_SVC_ENCODINGS[0].scalabilityMode = svc;
    }
  }

  (0, _createClass2.default)(RoomClient, [{
    key: "close",
    value: function close() {
      if (this._closed) return;
      this._closed = true;
      console.debug('close()'); // Close protoo Peer

      this._protoo.close(); // Close mediasoup Transports.


      if (this._sendTransport) this._sendTransport.close();
      if (this._recvTransport) this._recvTransport.close();
      this.disableMic();
      this.disableWebcam();
    }
  }, {
    key: "startRecord",
    value: function () {
      var _startRecord = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var startRecordRes;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this._protoo) {
                  _context.next = 3;
                  break;
                }

                console.warn("There is no websocket connection !");
                return _context.abrupt("return");

              case 3:
                console.debug("发送录制命令");
                _context.next = 6;
                return this._protoo.request('start-record', {
                  roomId: this.roomId
                });

              case 6:
                startRecordRes = _context.sent;
                console.debug(startRecordRes);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function startRecord() {
        return _startRecord.apply(this, arguments);
      }

      return startRecord;
    }()
  }, {
    key: "stopRecord",
    value: function () {
      var _stopRecord = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(callback) {
        var res;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this._recordCallback = callback;

                if (this._protoo) {
                  _context2.next = 4;
                  break;
                }

                console.warn("There is no websocket connection !");
                return _context2.abrupt("return");

              case 4:
                _context2.next = 6;
                return this._protoo.request('stop-record', {
                  roomId: this.roomId
                });

              case 6:
                res = _context2.sent;
                console.debug(res);
                callback(res);

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function stopRecord(_x) {
        return _stopRecord.apply(this, arguments);
      }

      return stopRecord;
    }()
  }, {
    key: "join",
    value: function () {
      var _join = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var _this = this;

        var protooTransport;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // 创建websockt通信,WebSocketTransport 是一种特殊处理过的websocket
                console.debug("_protooUrl: %s", this._protooUrl);
                protooTransport = new _protooClient.default.WebSocketTransport(this._protooUrl);
                this._protoo = new _protooClient.default.Peer(protooTransport);

                this._protoo.on('open', function () {
                  return _this._joinRoom();
                });

                this._protoo.on('failed', function () {
                  console.error("protoo websocket failed !");
                });

                this._protoo.on('disconnected', function () {
                  // Close mediasoup Transports.
                  if (_this._sendTransport) {
                    _this._sendTransport.close();

                    _this._sendTransport = null;
                  }

                  if (_this._recvTransport) {
                    _this._recvTransport.close();

                    _this._recvTransport = null;
                  }
                });

                this._protoo.on('close', function () {
                  if (_this._closed) return;

                  _this.close();
                });

                this._protoo.on('request', /*#__PURE__*/function () {
                  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(request, accept, reject) {
                    var _request$data, peerId, producerId, id, kind, rtpParameters, type, appData, producerPaused, consumer, _mediasoupClient$pars, spatialLayers, temporalLayers, _request$data2, _peerId, dataProducerId, _id, sctpStreamParameters, label, protocol, _appData, dataConsumer;

                    return _regenerator.default.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            console.debug('proto "request" event [method:%s, data:%o]', request.method, request.data);
                            _context3.t0 = request.method;
                            _context3.next = _context3.t0 === 'newConsumer' ? 4 : _context3.t0 === 'newDataConsumer' ? 28 : 53;
                            break;

                          case 4:
                            if (_this._consume) {
                              _context3.next = 7;
                              break;
                            }

                            reject(403, 'I do not want to consume');
                            return _context3.abrupt("break", 53);

                          case 7:
                            _request$data = request.data, peerId = _request$data.peerId, producerId = _request$data.producerId, id = _request$data.id, kind = _request$data.kind, rtpParameters = _request$data.rtpParameters, type = _request$data.type, appData = _request$data.appData, producerPaused = _request$data.producerPaused;
                            _context3.prev = 8;
                            _context3.next = 11;
                            return _this._recvTransport.consume({
                              id,
                              producerId,
                              kind,
                              rtpParameters,
                              appData: _objectSpread(_objectSpread({}, appData), {}, {
                                peerId
                              }) // Trick.

                            });

                          case 11:
                            consumer = _context3.sent;
                            console.debug("创建新 consumer ...%o", consumer); // Store in the map.

                            _this._consumers.set(consumer.id, consumer); // this._remoteAudio.srcObject = new MediaStream(consumer.track);


                            console.debug("创建新的consumer.track:%o", consumer.track);
                            if (!_this.remoteStream) _this.remoteStream = new MediaStream();

                            _this.remoteStream.addTrack(consumer.track);

                            if (_this.getRemoteStream) _this.getRemoteStream(_this.remoteStream);
                            consumer.on('transportclose', function () {
                              _this._consumers.delete(consumer.id);
                            });
                            _mediasoupClient$pars = mediasoupClient.parseScalabilityMode(consumer.rtpParameters.encodings[0].scalabilityMode), spatialLayers = _mediasoupClient$pars.spatialLayers, temporalLayers = _mediasoupClient$pars.temporalLayers; // We are ready. Answer the protoo request so the server will
                            // resume this Consumer (which was paused for now if video).

                            accept(); // If audio-only mode is enabled, pause it.
                            // if (consumer.kind === 'video')
                            // 	this._pauseConsumer(consumer);

                            _context3.next = 27;
                            break;

                          case 23:
                            _context3.prev = 23;
                            _context3.t1 = _context3["catch"](8);
                            console.error('"newConsumer" request failed:%o', _context3.t1);
                            throw _context3.t1;

                          case 27:
                            return _context3.abrupt("break", 53);

                          case 28:
                            if (_this._consume) {
                              _context3.next = 31;
                              break;
                            }

                            reject(403, 'I do not want to data consume');
                            return _context3.abrupt("break", 53);

                          case 31:
                            if (_this._useDataChannel) {
                              _context3.next = 34;
                              break;
                            }

                            reject(403, 'I do not want DataChannels');
                            return _context3.abrupt("break", 53);

                          case 34:
                            _request$data2 = request.data, _peerId = _request$data2.peerId, dataProducerId = _request$data2.dataProducerId, _id = _request$data2.id, sctpStreamParameters = _request$data2.sctpStreamParameters, label = _request$data2.label, protocol = _request$data2.protocol, _appData = _request$data2.appData;
                            _context3.prev = 35;
                            _context3.next = 38;
                            return _this._recvTransport.consumeData({
                              id: _id,
                              dataProducerId,
                              sctpStreamParameters,
                              label,
                              protocol,
                              appData: _objectSpread(_objectSpread({}, _appData), {}, {
                                peerId: _peerId
                              }) // Trick.

                            });

                          case 38:
                            dataConsumer = _context3.sent;

                            // Store in the map.
                            _this._dataConsumers.set(dataConsumer.id, dataConsumer);

                            dataConsumer.on('transportclose', function () {
                              _this._dataConsumers.delete(dataConsumer.id);
                            });
                            dataConsumer.on('open', function () {
                              // TODO: 开始文字聊天回调
                              console.debug('DataConsumer "open" event');
                            });
                            dataConsumer.on('close', function () {
                              // TODO: 结束文字聊天回调
                              console.debug('DataConsumer "close" event');

                              _this._dataConsumers.delete(dataConsumer.id);
                            });
                            dataConsumer.on('error', function (error) {
                              console.error('DataConsumer "error" event:%o', error);
                            });
                            dataConsumer.on('message', function (message) {
                              console.debug('DataConsumer "message" event [streamId:%d]', dataConsumer.sctpStreamParameters.streamId);

                              if (message instanceof ArrayBuffer) {
                                var view = new DataView(message);
                                var number = view.getUint32();

                                if (number == Math.pow(2, 32) - 1) {
                                  console.warn('dataChannelTest finished!');
                                  _this._nextDataChannelTestNumber = 0;
                                  return;
                                }

                                if (number > _this._nextDataChannelTestNumber) {
                                  console.warn('dataChannelTest: %s packets missing', number - _this._nextDataChannelTestNumber);
                                }

                                _this._nextDataChannelTestNumber = number + 1;
                                return;
                              } else if (typeof message !== 'string') {
                                console.warn('ignoring DataConsumer "message" (not a string)');
                                return;
                              }

                              switch (dataConsumer.label) {
                                case 'chat':
                                  {
                                    console.debug("data consumer label is chat !");

                                    _this.onChatData(message);

                                    break;
                                  }

                                case 'bot':
                                  {
                                    break;
                                  }
                              }
                            }); // We are ready. Answer the protoo request.

                            accept();
                            _context3.next = 52;
                            break;

                          case 48:
                            _context3.prev = 48;
                            _context3.t2 = _context3["catch"](35);
                            console.error('"newDataConsumer" request failed:%o', _context3.t2);
                            throw _context3.t2;

                          case 52:
                            return _context3.abrupt("break", 53);

                          case 53:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3, null, [[8, 23], [35, 48]]);
                  }));

                  return function (_x2, _x3, _x4) {
                    return _ref2.apply(this, arguments);
                  };
                }());

                this._protoo.on('notification', function (notification) {
                  // logger.debug(
                  // 	'proto "notification" event [method:%s, data:%o]',
                  // 	notification.method, notification.data);
                  switch (notification.method) {
                    case 'producerScore':
                      {
                        var _notification$data = notification.data,
                            producerId = _notification$data.producerId,
                            score = _notification$data.score;
                        break;
                      }

                    case 'newPeer':
                      {
                        var peer = notification.data;

                        _this.handlerActionCallback({
                          action: 'other-connected',
                          info: JSON.stringify(peer)
                        });

                        break;
                      }

                    case 'peerClosed':
                      {
                        var peerId = notification.data.peerId;

                        _this.handlerActionCallback({
                          action: 'other-disconnect',
                          info: peerId
                        });

                        break;
                      }

                    case 'peerDisplayNameChanged':
                      {
                        var _notification$data2 = notification.data,
                            _peerId2 = _notification$data2.peerId,
                            displayName = _notification$data2.displayName,
                            oldDisplayName = _notification$data2.oldDisplayName;
                        break;
                      }

                    case 'downlinkBwe':
                      {
                        console.debug('\'downlinkBwe\' event:%o', notification.data);
                        break;
                      }

                    case 'consumerClosed':
                      {
                        var consumerId = notification.data.consumerId;

                        var consumer = _this._consumers.get(consumerId);

                        if (!consumer) break;

                        _this.remoteStream.removeTrack(consumer.track);

                        consumer.close();

                        _this._consumers.delete(consumerId);

                        var _peerId3 = consumer.appData.peerId;
                        break;
                      }

                    case 'consumerPaused':
                      {
                        var _consumerId = notification.data.consumerId;

                        var _consumer = _this._consumers.get(_consumerId);

                        if (!_consumer) break;

                        _consumer.pause();

                        break;
                      }

                    case 'consumerResumed':
                      {
                        var _consumerId2 = notification.data.consumerId;

                        var _consumer2 = _this._consumers.get(_consumerId2);

                        if (!_consumer2) break;

                        _consumer2.resume();

                        break;
                      }

                    case 'consumerLayersChanged':
                      {
                        var _notification$data3 = notification.data,
                            _consumerId3 = _notification$data3.consumerId,
                            spatialLayer = _notification$data3.spatialLayer,
                            temporalLayer = _notification$data3.temporalLayer;

                        var _consumer3 = _this._consumers.get(_consumerId3);

                        if (!_consumer3) break;
                        break;
                      }

                    case 'consumerScore':
                      {
                        var _notification$data4 = notification.data,
                            _consumerId4 = _notification$data4.consumerId,
                            _score = _notification$data4.score;
                        break;
                      }

                    case 'dataConsumerClosed':
                      {
                        var dataConsumerId = notification.data.dataConsumerId;

                        var dataConsumer = _this._dataConsumers.get(dataConsumerId);

                        if (!dataConsumer) break;
                        dataConsumer.close();

                        _this._dataConsumers.delete(dataConsumerId);

                        var _peerId4 = dataConsumer.appData.peerId;
                        break;
                      }

                    case 'activeSpeaker':
                      {
                        var _peerId5 = notification.data.peerId;
                        break;
                      }

                    default:
                      {
                        console.error('unknown protoo notification.method "%s"', notification.method);
                      }
                  }
                });

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function join() {
        return _join.apply(this, arguments);
      }

      return join;
    }()
  }, {
    key: "enableMic",
    value: function () {
      var _enableMic = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var _this2 = this;

        var track;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                console.debug('enableMic()');

                if (!this._micProducer) {
                  _context5.next = 3;
                  break;
                }

                return _context5.abrupt("return");

              case 3:
                if (this._mediasoupDevice.canProduce('audio')) {
                  _context5.next = 6;
                  break;
                }

                console.error('enableMic() | cannot produce audio');
                return _context5.abrupt("return");

              case 6:
                _context5.prev = 6;
                console.debug('enableMic() | calling getUserMedia()');
                track = this.localStream.getAudioTracks()[0];
                if (!this.localStream) this.localStream = new MediaStream();
                this.localStream.addTrack(track);
                _context5.next = 13;
                return this._sendTransport.produce({
                  track,
                  codecOptions: {
                    opusStereo: 1,
                    opusDtx: 1
                  } // NOTE: for testing codec selection.
                  // codec : this._mediasoupDevice.rtpCapabilities.codecs
                  // 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')

                });

              case 13:
                this._micProducer = _context5.sent;

                this._micProducer.on('transportclose', function () {
                  _this2._micProducer = null;
                });

                this._micProducer.on('trackended', function () {
                  _this2.disableMic().catch(function () {});
                });

                _context5.next = 22;
                break;

              case 18:
                _context5.prev = 18;
                _context5.t0 = _context5["catch"](6);
                console.error('enableMic() | failed:%o', _context5.t0);
                if (track) track.stop();

              case 22:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[6, 18]]);
      }));

      function enableMic() {
        return _enableMic.apply(this, arguments);
      }

      return enableMic;
    }()
  }, {
    key: "enableShareMp3",
    value: function () {
      var _enableShareMp = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6(trackMp3, duration) {
        var _this3 = this;

        var track, cons, stream, mp3Mixer, mp3Stream;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                console.debug('enableMp3 , duration is ', duration); // if (this._micProducer) 
                // 	return;

                if (this._micProducer) {
                  _context6.next = 4;
                  break;
                }

                console.error('mic disabled');
                return _context6.abrupt("return");

              case 4:
                if (this._mediasoupDevice.canProduce('audio')) {
                  _context6.next = 7;
                  break;
                }

                console.error('enableMic() | cannot produce audio');
                return _context6.abrupt("return");

              case 7:
                _context6.prev = 7;
                console.debug('enableMic() | calling getUserMedia()');
                cons = this.makeAudioConstraints();
                stream = new MediaStream();
                stream.addTrack(this.localStream.getAudioTracks()[0]);
                mp3Mixer = new _multistreamsmixer.default([stream, trackMp3]);
                mp3Stream = mp3Mixer.getMixedStream();
                track = mp3Stream.getAudioTracks()[0];
                this.localStream.addTrack(mp3Stream.getAudioTracks()[0]);
                this.getLocalStream(localStream);
                _context6.next = 19;
                return this._sendTransport.produce({
                  track,
                  codecOptions: {
                    opusStereo: 1,
                    opusDtx: 1
                  } // NOTE: for testing codec selection.
                  // codec : this._mediasoupDevice.rtpCapabilities.codecs
                  // 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')

                });

              case 19:
                this._micProducer = _context6.sent;

                this._micProducer.on('transportclose', function () {
                  _this3._micProducer = null;
                });

                this._micProducer.on('trackended', function () {
                  _this3.disableMic().catch(function () {});
                });

                _context6.next = 28;
                break;

              case 24:
                _context6.prev = 24;
                _context6.t0 = _context6["catch"](7);
                console.error('enableMic() | failed:%o', _context6.t0);
                if (track) track.stop();

              case 28:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[7, 24]]);
      }));

      function enableShareMp3(_x5, _x6) {
        return _enableShareMp.apply(this, arguments);
      }

      return enableShareMp3;
    }()
  }, {
    key: "disableMic",
    value: function () {
      var _disableMic = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        var _this4 = this;

        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                console.debug('disableMic()');

                if (this._micProducer) {
                  _context7.next = 3;
                  break;
                }

                return _context7.abrupt("return");

              case 3:
                this._micProducer.close();

                this.localStream.getAudioTracks().forEach(function (track) {
                  // logger.log(track);
                  _this4.localStream.removeTrack(track);
                });
                _context7.prev = 5;
                _context7.next = 8;
                return this._protoo.request('closeProducer', {
                  producerId: this._micProducer.id
                });

              case 8:
                _context7.next = 13;
                break;

              case 10:
                _context7.prev = 10;
                _context7.t0 = _context7["catch"](5);
                console.debug("this._protoo.request error ...");

              case 13:
                this._micProducer = null;

              case 14:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[5, 10]]);
      }));

      function disableMic() {
        return _disableMic.apply(this, arguments);
      }

      return disableMic;
    }()
  }, {
    key: "muteMic",
    value: function () {
      var _muteMic = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8() {
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                console.debug('muteMic()');

                this._micProducer.pause();

                _context8.prev = 2;
                _context8.next = 5;
                return this._protoo.request('pauseProducer', {
                  producerId: this._micProducer.id
                });

              case 5:
                _context8.next = 10;
                break;

              case 7:
                _context8.prev = 7;
                _context8.t0 = _context8["catch"](2);
                console.error('muteMic() | failed: %o', _context8.t0);

              case 10:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[2, 7]]);
      }));

      function muteMic() {
        return _muteMic.apply(this, arguments);
      }

      return muteMic;
    }()
  }, {
    key: "unmuteMic",
    value: function () {
      var _unmuteMic = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9() {
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                console.debug('unmuteMic()');

                this._micProducer.resume();

                _context9.prev = 2;
                _context9.next = 5;
                return this._protoo.request('resumeProducer', {
                  producerId: this._micProducer.id
                });

              case 5:
                _context9.next = 10;
                break;

              case 7:
                _context9.prev = 7;
                _context9.t0 = _context9["catch"](2);
                console.error('unmuteMic() | failed: %o', _context9.t0);

              case 10:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this, [[2, 7]]);
      }));

      function unmuteMic() {
        return _unmuteMic.apply(this, arguments);
      }

      return unmuteMic;
    }()
  }, {
    key: "enableWebcam",
    value: function () {
      var _enableWebcam = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee10() {
        var _this5 = this;

        var track, device, resolution, encodings, codec, codecOptions, firstVideoCodec;
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                console.debug("开始打开摄像头!!!!");

                if (!this._webcamProducer) {
                  _context10.next = 5;
                  break;
                }

                return _context10.abrupt("return");

              case 5:
                if (!this._shareProducer) {
                  _context10.next = 8;
                  break;
                }

                _context10.next = 8;
                return this.disableShareDesktop();

              case 8:
                if (this._mediasoupDevice.canProduce('video')) {
                  _context10.next = 11;
                  break;
                }

                console.error('enableWebcam() | cannot produce video');
                return _context10.abrupt("return");

              case 11:
                _context10.prev = 11;
                _context10.next = 14;
                return this._updateWebcams();

              case 14:
                device = this._webcam.device;
                resolution = this._webcam.resolution;

                if (device) {
                  _context10.next = 18;
                  break;
                }

                throw new Error('no webcam devices');

              case 18:
                console.debug('enableWebcam() | calling getUserMedia()');
                track = localStream.getVideoTracks()[0];
                codecOptions = {
                  videoGoogleStartBitrate: 320
                };

                if (!this._forceH264) {
                  _context10.next = 27;
                  break;
                }

                codec = this._mediasoupDevice.rtpCapabilities.codecs.find(function (c) {
                  return c.mimeType.toLowerCase() === 'video/h264';
                });

                if (codec) {
                  _context10.next = 25;
                  break;
                }

                throw new Error('desired H264 codec+configuration is not supported');

              case 25:
                _context10.next = 31;
                break;

              case 27:
                if (!this._forceVP9) {
                  _context10.next = 31;
                  break;
                }

                codec = this._mediasoupDevice.rtpCapabilities.codecs.find(function (c) {
                  return c.mimeType.toLowerCase() === 'video/vp9';
                });

                if (codec) {
                  _context10.next = 31;
                  break;
                }

                throw new Error('desired VP9 codec+configuration is not supported');

              case 31:
                if (this._useSimulcast) {
                  // If VP9 is the only available video codec then use SVC.
                  firstVideoCodec = this._mediasoupDevice.rtpCapabilities.codecs.find(function (c) {
                    return c.kind === 'video';
                  });

                  if (this._forceVP9 && codec || firstVideoCodec.mimeType.toLowerCase() === 'video/vp9') {
                    encodings = WEBCAM_KSVC_ENCODINGS;
                  } else {
                    encodings = WEBCAM_SIMULCAST_ENCODINGS;
                  }
                }

                _context10.next = 34;
                return this._sendTransport.produce({
                  track,
                  encodings,
                  codecOptions,
                  codec
                });

              case 34:
                this._webcamProducer = _context10.sent;

                this._webcamProducer.on('transportclose', function () {
                  _this5._webcamProducer = null;
                });

                this._webcamProducer.on('trackended', function () {
                  _this5.disableWebcam().catch(function () {});
                });

                _context10.next = 43;
                break;

              case 39:
                _context10.prev = 39;
                _context10.t0 = _context10["catch"](11);
                console.error('enableWebcam() | failed:%o', _context10.t0);
                if (track) track.stop();

              case 43:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[11, 39]]);
      }));

      function enableWebcam() {
        return _enableWebcam.apply(this, arguments);
      }

      return enableWebcam;
    }()
  }, {
    key: "disableWebcam",
    value: function () {
      var _disableWebcam = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee11() {
        var _this6 = this;

        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                console.debug('disableWebcam()');

                if (this._webcamProducer) {
                  _context11.next = 3;
                  break;
                }

                return _context11.abrupt("return");

              case 3:
                this._webcamProducer.close();

                this.localStream.getVideoTracks().forEach(function (track) {
                  // logger.log(track);
                  _this6.localStream.removeTrack(track);
                });
                _context11.prev = 5;
                _context11.next = 8;
                return this._protoo.request('closeProducer', {
                  producerId: this._webcamProducer.id
                });

              case 8:
                _context11.next = 13;
                break;

              case 10:
                _context11.prev = 10;
                _context11.t0 = _context11["catch"](5);
                console.debug('disableWebcam() error !');

              case 13:
                this._webcamProducer = null;

              case 14:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this, [[5, 10]]);
      }));

      function disableWebcam() {
        return _disableWebcam.apply(this, arguments);
      }

      return disableWebcam;
    }()
  }, {
    key: "changeWebcam",
    value: function () {
      var _changeWebcam = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee12() {
        var array, len, deviceId, idx, stream, track;
        return _regenerator.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                console.debug('changeWebcam()');
                _context12.prev = 1;
                _context12.next = 4;
                return this._updateWebcams();

              case 4:
                array = Array.from(this._webcams.keys());
                len = array.length;
                deviceId = this._webcam.device ? this._webcam.device.deviceId : undefined;
                idx = array.indexOf(deviceId);
                if (idx < len - 1) idx++;else idx = 0;
                this._webcam.device = this._webcams.get(array[idx]);
                console.debug('changeWebcam() | new selected webcam [device:%o]', this._webcam.device); // Reset video resolution to HD.

                this._webcam.resolution = 'hd';

                if (this._webcam.device) {
                  _context12.next = 14;
                  break;
                }

                throw new Error('no webcam devices');

              case 14:
                // Closing the current video track before asking for a new one (mobiles do not like
                // having both front/back cameras open at the same time).
                this._webcamProducer.track.stop();

                console.debug('changeWebcam() | calling getUserMedia()');
                _context12.next = 18;
                return navigator.mediaDevices.getUserMedia({
                  video: _objectSpread({
                    deviceId: {
                      exact: this._webcam.device.deviceId
                    }
                  }, VIDEO_CONSTRAINS[this._webcam.resolution])
                });

              case 18:
                stream = _context12.sent;
                track = stream.getVideoTracks()[0];
                _context12.next = 22;
                return this._webcamProducer.replaceTrack({
                  track
                });

              case 22:
                _context12.next = 27;
                break;

              case 24:
                _context12.prev = 24;
                _context12.t0 = _context12["catch"](1);
                console.error('changeWebcam() | failed: %o', _context12.t0);

              case 27:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[1, 24]]);
      }));

      function changeWebcam() {
        return _changeWebcam.apply(this, arguments);
      }

      return changeWebcam;
    }()
  }, {
    key: "changeWebcamResolution",
    value: function () {
      var _changeWebcamResolution = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee13() {
        var stream, track;
        return _regenerator.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                console.debug('changeWebcamResolution()');
                _context13.prev = 1;
                _context13.t0 = this._webcam.resolution;
                _context13.next = _context13.t0 === 'qvga' ? 5 : _context13.t0 === 'vga' ? 7 : _context13.t0 === 'hd' ? 9 : 11;
                break;

              case 5:
                this._webcam.resolution = 'vga';
                return _context13.abrupt("break", 12);

              case 7:
                this._webcam.resolution = 'hd';
                return _context13.abrupt("break", 12);

              case 9:
                this._webcam.resolution = 'qvga';
                return _context13.abrupt("break", 12);

              case 11:
                this._webcam.resolution = 'hd';

              case 12:
                console.debug('changeWebcamResolution() | calling getUserMedia()');
                _context13.next = 15;
                return navigator.mediaDevices.getUserMedia({
                  video: _objectSpread({
                    deviceId: {
                      exact: this._webcam.device.deviceId
                    }
                  }, VIDEO_CONSTRAINS[this._webcam.resolution])
                });

              case 15:
                stream = _context13.sent;
                track = stream.getVideoTracks()[0];
                _context13.next = 19;
                return this._webcamProducer.replaceTrack({
                  track
                });

              case 19:
                _context13.next = 24;
                break;

              case 21:
                _context13.prev = 21;
                _context13.t1 = _context13["catch"](1);
                console.error('changeWebcamResolution() | failed: %o', _context13.t1);

              case 24:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this, [[1, 21]]);
      }));

      function changeWebcamResolution() {
        return _changeWebcamResolution.apply(this, arguments);
      }

      return changeWebcamResolution;
    }()
  }, {
    key: "enableShareDesktop",
    value: function () {
      var _enableShareDesktop = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee14() {
        var _this7 = this;

        var track, stream, encodings, codec, codecOptions, firstVideoCodec;
        return _regenerator.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                console.debug('enableShareDesktop()');

                if (!this._shareProducer) {
                  _context14.next = 5;
                  break;
                }

                return _context14.abrupt("return");

              case 5:
                if (!this._webcamProducer) {
                  _context14.next = 8;
                  break;
                }

                _context14.next = 8;
                return this.disableWebcam();

              case 8:
                if (this._mediasoupDevice.canProduce('video')) {
                  _context14.next = 11;
                  break;
                }

                console.error('enableShareDesktop() | cannot produce video');
                return _context14.abrupt("return");

              case 11:
                _context14.prev = 11;
                console.debug('enableShareDesktop() | calling getUserMedia()');
                _context14.next = 15;
                return navigator.mediaDevices.getDisplayMedia({
                  audio: false,
                  video: {
                    displaySurface: 'monitor',
                    logicalSurface: true,
                    cursor: true,
                    // width: { max: 1920 },
                    // height: { max: 1080 },
                    frameRate: {
                      max: 20
                    }
                  }
                });

              case 15:
                stream = _context14.sent;

                if (stream) {
                  _context14.next = 18;
                  break;
                }

                return _context14.abrupt("return");

              case 18:
                track = stream.getVideoTracks()[0];
                codecOptions = {
                  videoGoogleStartBitrate: 1000
                };

                if (!this._forceH264) {
                  _context14.next = 26;
                  break;
                }

                codec = this._mediasoupDevice.rtpCapabilities.codecs.find(function (c) {
                  return c.mimeType.toLowerCase() === 'video/h264';
                });

                if (codec) {
                  _context14.next = 24;
                  break;
                }

                throw new Error('desired H264 codec+configuration is not supported');

              case 24:
                _context14.next = 30;
                break;

              case 26:
                if (!this._forceVP9) {
                  _context14.next = 30;
                  break;
                }

                codec = this._mediasoupDevice.rtpCapabilities.codecs.find(function (c) {
                  return c.mimeType.toLowerCase() === 'video/vp9';
                });

                if (codec) {
                  _context14.next = 30;
                  break;
                }

                throw new Error('desired VP9 codec+configuration is not supported');

              case 30:
                if (this._useSharingSimulcast) {
                  // If VP9 is the only available video codec then use SVC.
                  firstVideoCodec = this._mediasoupDevice.rtpCapabilities.codecs.find(function (c) {
                    return c.kind === 'video';
                  });

                  if (this._forceVP9 && codec || firstVideoCodec.mimeType.toLowerCase() === 'video/vp9') {
                    encodings = SCREEN_SHARING_SVC_ENCODINGS;
                  } else {
                    encodings = SCREEN_SHARING_SIMULCAST_ENCODINGS.map(function (encoding) {
                      return _objectSpread(_objectSpread({}, encoding), {}, {
                        dtx: true
                      });
                    });
                  }
                }

                _context14.next = 33;
                return this._sendTransport.produce({
                  track,
                  encodings,
                  codecOptions,
                  codec,
                  appData: {
                    share: true
                  }
                });

              case 33:
                this._shareProducer = _context14.sent;

                this._shareProducer.on('transportclose', function () {
                  _this7._shareProducer = null;
                });

                this._shareProducer.on('trackended', function () {
                  _this7.disableShareDesktop().catch(function () {});
                });

                _context14.next = 43;
                break;

              case 38:
                _context14.prev = 38;
                _context14.t0 = _context14["catch"](11);
                console.error('enableShareDesktop() | failed:%o', _context14.t0);

                if (_context14.t0.name !== 'NotAllowedError') {}

                if (track) track.stop();

              case 43:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this, [[11, 38]]);
      }));

      function enableShareDesktop() {
        return _enableShareDesktop.apply(this, arguments);
      }

      return enableShareDesktop;
    }()
  }, {
    key: "disableShareDesktop",
    value: function () {
      var _disableShareDesktop = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee15() {
        return _regenerator.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                console.debug('disableShareDesktop()');

                if (this._shareProducer) {
                  _context15.next = 3;
                  break;
                }

                return _context15.abrupt("return");

              case 3:
                this._shareProducer.close(); // this.localStream.removeTrack(this.localStream.getVideoTracks());


                _context15.prev = 4;
                _context15.next = 7;
                return this._protoo.request('closeProducer', {
                  producerId: this._shareProducer.id
                });

              case 7:
                _context15.next = 12;
                break;

              case 9:
                _context15.prev = 9;
                _context15.t0 = _context15["catch"](4);
                console.error("disableShareDesktop() error !");

              case 12:
                this._shareProducer = null;

              case 13:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this, [[4, 9]]);
      }));

      function disableShareDesktop() {
        return _disableShareDesktop.apply(this, arguments);
      }

      return disableShareDesktop;
    }()
  }, {
    key: "enableAudioOnly",
    value: function () {
      var _enableAudioOnly = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee16() {
        var _iterator, _step, consumer;

        return _regenerator.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                console.debug('enableAudioOnly()');
                this.disableWebcam();
                _iterator = _createForOfIteratorHelper(this._consumers.values());
                _context16.prev = 3;

                _iterator.s();

              case 5:
                if ((_step = _iterator.n()).done) {
                  _context16.next = 12;
                  break;
                }

                consumer = _step.value;

                if (!(consumer.kind !== 'video')) {
                  _context16.next = 9;
                  break;
                }

                return _context16.abrupt("continue", 10);

              case 9:
                this._pauseConsumer(consumer);

              case 10:
                _context16.next = 5;
                break;

              case 12:
                _context16.next = 17;
                break;

              case 14:
                _context16.prev = 14;
                _context16.t0 = _context16["catch"](3);

                _iterator.e(_context16.t0);

              case 17:
                _context16.prev = 17;

                _iterator.f();

                return _context16.finish(17);

              case 20:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this, [[3, 14, 17, 20]]);
      }));

      function enableAudioOnly() {
        return _enableAudioOnly.apply(this, arguments);
      }

      return enableAudioOnly;
    }()
  }, {
    key: "disableAudioOnly",
    value: function () {
      var _disableAudioOnly = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee17() {
        var _iterator2, _step2, consumer;

        return _regenerator.default.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                console.debug('disableAudioOnly()');

                if (!this._webcamProducer && this._produce && (cookiesManager.getDevices() || {}).webcamEnabled) {
                  this.enableWebcam();
                }

                _iterator2 = _createForOfIteratorHelper(this._consumers.values());
                _context17.prev = 3;

                _iterator2.s();

              case 5:
                if ((_step2 = _iterator2.n()).done) {
                  _context17.next = 12;
                  break;
                }

                consumer = _step2.value;

                if (!(consumer.kind !== 'video')) {
                  _context17.next = 9;
                  break;
                }

                return _context17.abrupt("continue", 10);

              case 9:
                this._resumeConsumer(consumer);

              case 10:
                _context17.next = 5;
                break;

              case 12:
                _context17.next = 17;
                break;

              case 14:
                _context17.prev = 14;
                _context17.t0 = _context17["catch"](3);

                _iterator2.e(_context17.t0);

              case 17:
                _context17.prev = 17;

                _iterator2.f();

                return _context17.finish(17);

              case 20:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this, [[3, 14, 17, 20]]);
      }));

      function disableAudioOnly() {
        return _disableAudioOnly.apply(this, arguments);
      }

      return disableAudioOnly;
    }()
  }, {
    key: "muteAudio",
    value: function () {
      var _muteAudio = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee18() {
        return _regenerator.default.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                console.debug('muteAudio()');

              case 1:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18);
      }));

      function muteAudio() {
        return _muteAudio.apply(this, arguments);
      }

      return muteAudio;
    }()
  }, {
    key: "unmuteAudio",
    value: function () {
      var _unmuteAudio = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee19() {
        return _regenerator.default.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                console.debug('unmuteAudio()');

              case 1:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19);
      }));

      function unmuteAudio() {
        return _unmuteAudio.apply(this, arguments);
      }

      return unmuteAudio;
    }()
  }, {
    key: "restartIce",
    value: function () {
      var _restartIce = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee20() {
        var iceParameters, _iceParameters;

        return _regenerator.default.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                console.debug('restartIce()');
                _context20.prev = 1;

                if (!this._sendTransport) {
                  _context20.next = 8;
                  break;
                }

                _context20.next = 5;
                return this._protoo.request('restartIce', {
                  transportId: this._sendTransport.id
                });

              case 5:
                iceParameters = _context20.sent;
                _context20.next = 8;
                return this._sendTransport.restartIce({
                  iceParameters
                });

              case 8:
                if (!this._recvTransport) {
                  _context20.next = 14;
                  break;
                }

                _context20.next = 11;
                return this._protoo.request('restartIce', {
                  transportId: this._recvTransport.id
                });

              case 11:
                _iceParameters = _context20.sent;
                _context20.next = 14;
                return this._recvTransport.restartIce({
                  iceParameters: _iceParameters
                });

              case 14:
                _context20.next = 19;
                break;

              case 16:
                _context20.prev = 16;
                _context20.t0 = _context20["catch"](1);
                console.error('restartIce() | failed:%o', _context20.t0);

              case 19:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this, [[1, 16]]);
      }));

      function restartIce() {
        return _restartIce.apply(this, arguments);
      }

      return restartIce;
    }()
  }, {
    key: "setMaxSendingSpatialLayer",
    value: function () {
      var _setMaxSendingSpatialLayer = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee21(spatialLayer) {
        return _regenerator.default.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                console.debug('setMaxSendingSpatialLayer() [spatialLayer:%s]', spatialLayer);
                _context21.prev = 1;

                if (!this._webcamProducer) {
                  _context21.next = 7;
                  break;
                }

                _context21.next = 5;
                return this._webcamProducer.setMaxSpatialLayer(spatialLayer);

              case 5:
                _context21.next = 10;
                break;

              case 7:
                if (!this._shareProducer) {
                  _context21.next = 10;
                  break;
                }

                _context21.next = 10;
                return this._shareProducer.setMaxSpatialLayer(spatialLayer);

              case 10:
                _context21.next = 15;
                break;

              case 12:
                _context21.prev = 12;
                _context21.t0 = _context21["catch"](1);
                console.error('setMaxSendingSpatialLayer() | failed:%o', _context21.t0);

              case 15:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this, [[1, 12]]);
      }));

      function setMaxSendingSpatialLayer(_x7) {
        return _setMaxSendingSpatialLayer.apply(this, arguments);
      }

      return setMaxSendingSpatialLayer;
    }()
  }, {
    key: "setConsumerPreferredLayers",
    value: function () {
      var _setConsumerPreferredLayers = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee22(consumerId, spatialLayer, temporalLayer) {
        return _regenerator.default.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                console.debug('setConsumerPreferredLayers() [consumerId:%s, spatialLayer:%s, temporalLayer:%s]', consumerId, spatialLayer, temporalLayer);
                _context22.prev = 1;
                _context22.next = 4;
                return this._protoo.request('setConsumerPreferredLayers', {
                  consumerId,
                  spatialLayer,
                  temporalLayer
                });

              case 4:
                _context22.next = 9;
                break;

              case 6:
                _context22.prev = 6;
                _context22.t0 = _context22["catch"](1);
                console.error('setConsumerPreferredLayers() | failed:%o', _context22.t0);

              case 9:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this, [[1, 6]]);
      }));

      function setConsumerPreferredLayers(_x8, _x9, _x10) {
        return _setConsumerPreferredLayers.apply(this, arguments);
      }

      return setConsumerPreferredLayers;
    }()
  }, {
    key: "setConsumerPriority",
    value: function () {
      var _setConsumerPriority = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee23(consumerId, priority) {
        return _regenerator.default.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                console.debug('setConsumerPriority() [consumerId:%s, priority:%d]', consumerId, priority);
                _context23.prev = 1;
                _context23.next = 4;
                return this._protoo.request('setConsumerPriority', {
                  consumerId,
                  priority
                });

              case 4:
                _context23.next = 9;
                break;

              case 6:
                _context23.prev = 6;
                _context23.t0 = _context23["catch"](1);
                console.error('setConsumerPriority() | failed:%o', _context23.t0);

              case 9:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this, [[1, 6]]);
      }));

      function setConsumerPriority(_x11, _x12) {
        return _setConsumerPriority.apply(this, arguments);
      }

      return setConsumerPriority;
    }()
  }, {
    key: "requestConsumerKeyFrame",
    value: function () {
      var _requestConsumerKeyFrame = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee24(consumerId) {
        return _regenerator.default.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                console.debug('requestConsumerKeyFrame() [consumerId:%s]', consumerId);
                _context24.prev = 1;
                _context24.next = 4;
                return this._protoo.request('requestConsumerKeyFrame', {
                  consumerId
                });

              case 4:
                _context24.next = 9;
                break;

              case 6:
                _context24.prev = 6;
                _context24.t0 = _context24["catch"](1);
                console.error('requestConsumerKeyFrame() | failed:%o', _context24.t0);

              case 9:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this, [[1, 6]]);
      }));

      function requestConsumerKeyFrame(_x13) {
        return _requestConsumerKeyFrame.apply(this, arguments);
      }

      return requestConsumerKeyFrame;
    }()
  }, {
    key: "enableChatDataProducer",
    value: function () {
      var _enableChatDataProducer = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee25() {
        var _this8 = this;

        return _regenerator.default.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                console.debug('enableChatDataProducer()');

                if (this._useDataChannel) {
                  _context25.next = 3;
                  break;
                }

                return _context25.abrupt("return");

              case 3:
                _context25.prev = 3;
                _context25.next = 6;
                return this._sendTransport.produceData({
                  ordered: false,
                  maxRetransmits: 1,
                  label: 'chat',
                  priority: 'medium',
                  appData: {
                    info: 'my-chat-DataProducer'
                  }
                });

              case 6:
                this._chatDataProducer = _context25.sent;

                this._chatDataProducer.on('transportclose', function () {
                  _this8._chatDataProducer = null;

                  _this8.handlerActionCallback({
                    action: 'chatclosed'
                  });
                });

                this._chatDataProducer.on('open', function () {
                  console.debug('chat DataProducer "open" event');
                });

                this._chatDataProducer.on('close', function () {
                  console.error('chat DataProducer "close" event');
                  _this8._chatDataProducer = null;
                });

                this._chatDataProducer.on('error', function (error) {
                  console.error('chat DataProducer "error" event:%o', error);
                });

                this._chatDataProducer.on('bufferedamountlow', function () {
                  console.debug('chat DataProducer "bufferedamountlow" event');
                });

                _context25.next = 18;
                break;

              case 14:
                _context25.prev = 14;
                _context25.t0 = _context25["catch"](3);
                console.error('enableChatDataProducer() | failed:%o', _context25.t0);
                throw _context25.t0;

              case 18:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this, [[3, 14]]);
      }));

      function enableChatDataProducer() {
        return _enableChatDataProducer.apply(this, arguments);
      }

      return enableChatDataProducer;
    }()
  }, {
    key: "enableBotDataProducer",
    value: function () {
      var _enableBotDataProducer = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee26() {
        var _this9 = this;

        return _regenerator.default.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                console.debug('enableBotDataProducer()');

                if (this._useDataChannel) {
                  _context26.next = 3;
                  break;
                }

                return _context26.abrupt("return");

              case 3:
                _context26.prev = 3;
                _context26.next = 6;
                return this._sendTransport.produceData({
                  ordered: false,
                  maxPacketLifeTime: 2000,
                  label: 'bot',
                  priority: 'medium',
                  appData: {
                    info: 'my-bot-DataProducer'
                  }
                });

              case 6:
                this._botDataProducer = _context26.sent;

                this._botDataProducer.on('transportclose', function () {
                  _this9._botDataProducer = null;
                });

                this._botDataProducer.on('open', function () {
                  console.debug('bot DataProducer "open" event');
                });

                this._botDataProducer.on('close', function () {
                  console.error('bot DataProducer "close" event');
                  _this9._botDataProducer = null;
                });

                this._botDataProducer.on('error', function (error) {
                  console.error('bot DataProducer "error" event:%o', error);
                });

                this._botDataProducer.on('bufferedamountlow', function () {
                  console.debug('bot DataProducer "bufferedamountlow" event');
                });

                _context26.next = 18;
                break;

              case 14:
                _context26.prev = 14;
                _context26.t0 = _context26["catch"](3);
                console.error('enableBotDataProducer() | failed:%o', _context26.t0);
                throw _context26.t0;

              case 18:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this, [[3, 14]]);
      }));

      function enableBotDataProducer() {
        return _enableBotDataProducer.apply(this, arguments);
      }

      return enableBotDataProducer;
    }()
  }, {
    key: "sendChatMessage",
    value: function () {
      var _sendChatMessage = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee27(text) {
        return _regenerator.default.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                console.debug('sendChatMessage() [text:"%s]', text);

                if (this._chatDataProducer) {
                  _context27.next = 3;
                  break;
                }

                return _context27.abrupt("return");

              case 3:
                try {
                  this._chatDataProducer.send(text);
                } catch (error) {
                  console.error('chat DataProducer.send() failed:%o', error);
                }

              case 4:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function sendChatMessage(_x14) {
        return _sendChatMessage.apply(this, arguments);
      }

      return sendChatMessage;
    }()
  }, {
    key: "sendBotMessage",
    value: function () {
      var _sendBotMessage = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee28(text) {
        return _regenerator.default.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                console.debug('sendBotMessage() [text:"%s]', text);

                if (this._botDataProducer) {
                  _context28.next = 3;
                  break;
                }

                return _context28.abrupt("return");

              case 3:
                try {
                  this._botDataProducer.send(text);
                } catch (error) {
                  console.error('bot DataProducer.send() failed:%o', error);
                }

              case 4:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function sendBotMessage(_x15) {
        return _sendBotMessage.apply(this, arguments);
      }

      return sendBotMessage;
    }()
  }, {
    key: "changeDisplayName",
    value: function () {
      var _changeDisplayName = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee29(displayName) {
        return _regenerator.default.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                console.debug('changeDisplayName() [displayName:"%s"]', displayName); // Store in cookie.

                cookiesManager.setUser({
                  displayName
                });
                _context29.prev = 2;
                _context29.next = 5;
                return this._protoo.request('changeDisplayName', {
                  displayName
                });

              case 5:
                this._displayName = displayName;
                _context29.next = 11;
                break;

              case 8:
                _context29.prev = 8;
                _context29.t0 = _context29["catch"](2);
                console.error('changeDisplayName() | failed: %o', _context29.t0);

              case 11:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this, [[2, 8]]);
      }));

      function changeDisplayName(_x16) {
        return _changeDisplayName.apply(this, arguments);
      }

      return changeDisplayName;
    }()
  }, {
    key: "getSendTransportRemoteStats",
    value: function () {
      var _getSendTransportRemoteStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee30() {
        return _regenerator.default.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                console.debug('getSendTransportRemoteStats()');

                if (this._sendTransport) {
                  _context30.next = 3;
                  break;
                }

                return _context30.abrupt("return");

              case 3:
                return _context30.abrupt("return", this._protoo.request('getTransportStats', {
                  transportId: this._sendTransport.id
                }));

              case 4:
              case "end":
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function getSendTransportRemoteStats() {
        return _getSendTransportRemoteStats.apply(this, arguments);
      }

      return getSendTransportRemoteStats;
    }()
  }, {
    key: "getRecvTransportRemoteStats",
    value: function () {
      var _getRecvTransportRemoteStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee31() {
        return _regenerator.default.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                console.debug('getRecvTransportRemoteStats()');

                if (this._recvTransport) {
                  _context31.next = 3;
                  break;
                }

                return _context31.abrupt("return");

              case 3:
                return _context31.abrupt("return", this._protoo.request('getTransportStats', {
                  transportId: this._recvTransport.id
                }));

              case 4:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function getRecvTransportRemoteStats() {
        return _getRecvTransportRemoteStats.apply(this, arguments);
      }

      return getRecvTransportRemoteStats;
    }()
  }, {
    key: "getAudioRemoteStats",
    value: function () {
      var _getAudioRemoteStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee32() {
        return _regenerator.default.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                console.debug('getAudioRemoteStats()');

                if (this._micProducer) {
                  _context32.next = 3;
                  break;
                }

                return _context32.abrupt("return");

              case 3:
                return _context32.abrupt("return", this._protoo.request('getProducerStats', {
                  producerId: this._micProducer.id
                }));

              case 4:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function getAudioRemoteStats() {
        return _getAudioRemoteStats.apply(this, arguments);
      }

      return getAudioRemoteStats;
    }()
  }, {
    key: "getVideoRemoteStats",
    value: function () {
      var _getVideoRemoteStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee33() {
        var producer;
        return _regenerator.default.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                console.debug('getVideoRemoteStats()');
                producer = this._webcamProducer || this._shareProducer;

                if (producer) {
                  _context33.next = 4;
                  break;
                }

                return _context33.abrupt("return");

              case 4:
                return _context33.abrupt("return", this._protoo.request('getProducerStats', {
                  producerId: producer.id
                }));

              case 5:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function getVideoRemoteStats() {
        return _getVideoRemoteStats.apply(this, arguments);
      }

      return getVideoRemoteStats;
    }()
  }, {
    key: "getConsumerRemoteStats",
    value: function () {
      var _getConsumerRemoteStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee34(consumerId) {
        var consumer;
        return _regenerator.default.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                console.debug('getConsumerRemoteStats()');
                consumer = this._consumers.get(consumerId);

                if (consumer) {
                  _context34.next = 4;
                  break;
                }

                return _context34.abrupt("return");

              case 4:
                return _context34.abrupt("return", this._protoo.request('getConsumerStats', {
                  consumerId
                }));

              case 5:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function getConsumerRemoteStats(_x17) {
        return _getConsumerRemoteStats.apply(this, arguments);
      }

      return getConsumerRemoteStats;
    }()
  }, {
    key: "getChatDataProducerRemoteStats",
    value: function () {
      var _getChatDataProducerRemoteStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee35() {
        var dataProducer;
        return _regenerator.default.wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                console.debug('getChatDataProducerRemoteStats()');
                dataProducer = this._chatDataProducer;

                if (dataProducer) {
                  _context35.next = 4;
                  break;
                }

                return _context35.abrupt("return");

              case 4:
                return _context35.abrupt("return", this._protoo.request('getDataProducerStats', {
                  dataProducerId: dataProducer.id
                }));

              case 5:
              case "end":
                return _context35.stop();
            }
          }
        }, _callee35, this);
      }));

      function getChatDataProducerRemoteStats() {
        return _getChatDataProducerRemoteStats.apply(this, arguments);
      }

      return getChatDataProducerRemoteStats;
    }()
  }, {
    key: "getBotDataProducerRemoteStats",
    value: function () {
      var _getBotDataProducerRemoteStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee36() {
        var dataProducer;
        return _regenerator.default.wrap(function _callee36$(_context36) {
          while (1) {
            switch (_context36.prev = _context36.next) {
              case 0:
                console.debug('getBotDataProducerRemoteStats()');
                dataProducer = this._botDataProducer;

                if (dataProducer) {
                  _context36.next = 4;
                  break;
                }

                return _context36.abrupt("return");

              case 4:
                return _context36.abrupt("return", this._protoo.request('getDataProducerStats', {
                  dataProducerId: dataProducer.id
                }));

              case 5:
              case "end":
                return _context36.stop();
            }
          }
        }, _callee36, this);
      }));

      function getBotDataProducerRemoteStats() {
        return _getBotDataProducerRemoteStats.apply(this, arguments);
      }

      return getBotDataProducerRemoteStats;
    }()
  }, {
    key: "getDataConsumerRemoteStats",
    value: function () {
      var _getDataConsumerRemoteStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee37(dataConsumerId) {
        var dataConsumer;
        return _regenerator.default.wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                console.debug('getDataConsumerRemoteStats()');
                dataConsumer = this._dataConsumers.get(dataConsumerId);

                if (dataConsumer) {
                  _context37.next = 4;
                  break;
                }

                return _context37.abrupt("return");

              case 4:
                return _context37.abrupt("return", this._protoo.request('getDataConsumerStats', {
                  dataConsumerId
                }));

              case 5:
              case "end":
                return _context37.stop();
            }
          }
        }, _callee37, this);
      }));

      function getDataConsumerRemoteStats(_x18) {
        return _getDataConsumerRemoteStats.apply(this, arguments);
      }

      return getDataConsumerRemoteStats;
    }()
  }, {
    key: "getSendTransportLocalStats",
    value: function () {
      var _getSendTransportLocalStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee38() {
        return _regenerator.default.wrap(function _callee38$(_context38) {
          while (1) {
            switch (_context38.prev = _context38.next) {
              case 0:
                console.debug('getSendTransportLocalStats()');

                if (this._sendTransport) {
                  _context38.next = 3;
                  break;
                }

                return _context38.abrupt("return");

              case 3:
                return _context38.abrupt("return", this._sendTransport.getStats());

              case 4:
              case "end":
                return _context38.stop();
            }
          }
        }, _callee38, this);
      }));

      function getSendTransportLocalStats() {
        return _getSendTransportLocalStats.apply(this, arguments);
      }

      return getSendTransportLocalStats;
    }()
  }, {
    key: "getRecvTransportLocalStats",
    value: function () {
      var _getRecvTransportLocalStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee39() {
        return _regenerator.default.wrap(function _callee39$(_context39) {
          while (1) {
            switch (_context39.prev = _context39.next) {
              case 0:
                console.debug('getRecvTransportLocalStats()');

                if (this._recvTransport) {
                  _context39.next = 3;
                  break;
                }

                return _context39.abrupt("return");

              case 3:
                return _context39.abrupt("return", this._recvTransport.getStats());

              case 4:
              case "end":
                return _context39.stop();
            }
          }
        }, _callee39, this);
      }));

      function getRecvTransportLocalStats() {
        return _getRecvTransportLocalStats.apply(this, arguments);
      }

      return getRecvTransportLocalStats;
    }()
  }, {
    key: "getAudioLocalStats",
    value: function () {
      var _getAudioLocalStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee40() {
        return _regenerator.default.wrap(function _callee40$(_context40) {
          while (1) {
            switch (_context40.prev = _context40.next) {
              case 0:
                console.debug('getAudioLocalStats()');

                if (this._micProducer) {
                  _context40.next = 3;
                  break;
                }

                return _context40.abrupt("return");

              case 3:
                return _context40.abrupt("return", this._micProducer.getStats());

              case 4:
              case "end":
                return _context40.stop();
            }
          }
        }, _callee40, this);
      }));

      function getAudioLocalStats() {
        return _getAudioLocalStats.apply(this, arguments);
      }

      return getAudioLocalStats;
    }()
  }, {
    key: "getVideoLocalStats",
    value: function () {
      var _getVideoLocalStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee41() {
        var producer;
        return _regenerator.default.wrap(function _callee41$(_context41) {
          while (1) {
            switch (_context41.prev = _context41.next) {
              case 0:
                console.debug('getVideoLocalStats()');
                producer = this._webcamProducer || this._shareProducer;

                if (producer) {
                  _context41.next = 4;
                  break;
                }

                return _context41.abrupt("return");

              case 4:
                return _context41.abrupt("return", producer.getStats());

              case 5:
              case "end":
                return _context41.stop();
            }
          }
        }, _callee41, this);
      }));

      function getVideoLocalStats() {
        return _getVideoLocalStats.apply(this, arguments);
      }

      return getVideoLocalStats;
    }()
  }, {
    key: "getConsumerLocalStats",
    value: function () {
      var _getConsumerLocalStats = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee42(consumerId) {
        var consumer;
        return _regenerator.default.wrap(function _callee42$(_context42) {
          while (1) {
            switch (_context42.prev = _context42.next) {
              case 0:
                consumer = this._consumers.get(consumerId);

                if (consumer) {
                  _context42.next = 3;
                  break;
                }

                return _context42.abrupt("return");

              case 3:
                return _context42.abrupt("return", consumer.getStats());

              case 4:
              case "end":
                return _context42.stop();
            }
          }
        }, _callee42, this);
      }));

      function getConsumerLocalStats(_x19) {
        return _getConsumerLocalStats.apply(this, arguments);
      }

      return getConsumerLocalStats;
    }()
  }, {
    key: "applyNetworkThrottle",
    value: function () {
      var _applyNetworkThrottle = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee43(_ref3) {
        var uplink, downlink, rtt, secret;
        return _regenerator.default.wrap(function _callee43$(_context43) {
          while (1) {
            switch (_context43.prev = _context43.next) {
              case 0:
                uplink = _ref3.uplink, downlink = _ref3.downlink, rtt = _ref3.rtt, secret = _ref3.secret;
                console.debug('applyNetworkThrottle() [uplink:%s, downlink:%s, rtt:%s]', uplink, downlink, rtt);
                _context43.prev = 2;
                _context43.next = 5;
                return this._protoo.request('applyNetworkThrottle', {
                  uplink,
                  downlink,
                  rtt,
                  secret
                });

              case 5:
                _context43.next = 10;
                break;

              case 7:
                _context43.prev = 7;
                _context43.t0 = _context43["catch"](2);
                console.error('applyNetworkThrottle() | failed:%o', _context43.t0);

              case 10:
              case "end":
                return _context43.stop();
            }
          }
        }, _callee43, this, [[2, 7]]);
      }));

      function applyNetworkThrottle(_x20) {
        return _applyNetworkThrottle.apply(this, arguments);
      }

      return applyNetworkThrottle;
    }()
  }, {
    key: "resetNetworkThrottle",
    value: function () {
      var _resetNetworkThrottle = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee44(_ref4) {
        var _ref4$silent, silent, secret;

        return _regenerator.default.wrap(function _callee44$(_context44) {
          while (1) {
            switch (_context44.prev = _context44.next) {
              case 0:
                _ref4$silent = _ref4.silent, silent = _ref4$silent === void 0 ? false : _ref4$silent, secret = _ref4.secret;
                console.debug('resetNetworkThrottle()');
                _context44.prev = 2;
                _context44.next = 5;
                return this._protoo.request('resetNetworkThrottle', {
                  secret
                });

              case 5:
                _context44.next = 10;
                break;

              case 7:
                _context44.prev = 7;
                _context44.t0 = _context44["catch"](2);

                if (!silent) {
                  console.error('resetNetworkThrottle() | failed:%o', _context44.t0);
                }

              case 10:
              case "end":
                return _context44.stop();
            }
          }
        }, _callee44, this, [[2, 7]]);
      }));

      function resetNetworkThrottle(_x21) {
        return _resetNetworkThrottle.apply(this, arguments);
      }

      return resetNetworkThrottle;
    }()
  }, {
    key: "_pushMixedStream",
    value: function () {
      var _pushMixedStream2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee47(stream) {
        var _this10 = this;

        var routerRtpCapabilities, transportInfo, id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, _yield$this$_protoo$r, peers, audio_track, track, encodings, codec, codecOptions;

        return _regenerator.default.wrap(function _callee47$(_context47) {
          while (1) {
            switch (_context47.prev = _context47.next) {
              case 0:
                this._mediasoupDevice = new mediasoupClient.Device({
                  handlerName: this._handlerName
                });
                _context47.next = 3;
                return this._protoo.request('getRouterRtpCapabilities');

              case 3:
                routerRtpCapabilities = _context47.sent;
                _context47.next = 6;
                return this._mediasoupDevice.load({
                  routerRtpCapabilities
                });

              case 6:
                _context47.next = 8;
                return this._protoo.request('createWebRtcTransport', {
                  forceTcp: this._forceTcp,
                  producing: true,
                  consuming: false,
                  sctpCapabilities: this._useDataChannel ? this._mediasoupDevice.sctpCapabilities : undefined
                });

              case 8:
                transportInfo = _context47.sent;
                id = transportInfo.id, iceParameters = transportInfo.iceParameters, iceCandidates = transportInfo.iceCandidates, dtlsParameters = transportInfo.dtlsParameters, sctpParameters = transportInfo.sctpParameters;
                this._sendTransport = this._mediasoupDevice.createSendTransport({
                  id,
                  iceParameters,
                  iceCandidates,
                  dtlsParameters,
                  sctpParameters,
                  iceServers: [],
                  proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
                });

                this._sendTransport.on('connect', function (_ref5, callback, errback) // eslint-disable-line no-shadow
                {
                  var dtlsParameters = _ref5.dtlsParameters;

                  _this10._protoo.request('connectWebRtcTransport', {
                    transportId: _this10._sendTransport.id,
                    dtlsParameters
                  }).then(callback).catch(errback);
                });

                this._sendTransport.on('produce', /*#__PURE__*/function () {
                  var _ref7 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee45(_ref6, callback, errback) {
                    var kind, rtpParameters, appData, _yield$_this10$_proto, _id2;

                    return _regenerator.default.wrap(function _callee45$(_context45) {
                      while (1) {
                        switch (_context45.prev = _context45.next) {
                          case 0:
                            kind = _ref6.kind, rtpParameters = _ref6.rtpParameters, appData = _ref6.appData;
                            _context45.prev = 1;
                            _context45.next = 4;
                            return _this10._protoo.request('produce', {
                              transportId: _this10._sendTransport.id,
                              kind,
                              rtpParameters,
                              appData
                            });

                          case 4:
                            _yield$_this10$_proto = _context45.sent;
                            _id2 = _yield$_this10$_proto.id;
                            callback({
                              id: _id2
                            });
                            _context45.next = 12;
                            break;

                          case 9:
                            _context45.prev = 9;
                            _context45.t0 = _context45["catch"](1);
                            errback(_context45.t0);

                          case 12:
                          case "end":
                            return _context45.stop();
                        }
                      }
                    }, _callee45, null, [[1, 9]]);
                  }));

                  return function (_x23, _x24, _x25) {
                    return _ref7.apply(this, arguments);
                  };
                }());

                this._sendTransport.on('producedata', /*#__PURE__*/function () {
                  var _ref9 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee46(_ref8, callback, errback) {
                    var sctpStreamParameters, label, protocol, appData, _yield$_this10$_proto2, _id3;

                    return _regenerator.default.wrap(function _callee46$(_context46) {
                      while (1) {
                        switch (_context46.prev = _context46.next) {
                          case 0:
                            sctpStreamParameters = _ref8.sctpStreamParameters, label = _ref8.label, protocol = _ref8.protocol, appData = _ref8.appData;
                            console.debug('"producedata" event: [sctpStreamParameters:%o, appData:%o]', sctpStreamParameters, appData);
                            _context46.prev = 2;
                            _context46.next = 5;
                            return _this10._protoo.request('produceData', {
                              transportId: _this10._sendTransport.id,
                              sctpStreamParameters,
                              label,
                              protocol,
                              appData
                            });

                          case 5:
                            _yield$_this10$_proto2 = _context46.sent;
                            _id3 = _yield$_this10$_proto2.id;
                            callback({
                              id: _id3
                            });
                            _context46.next = 13;
                            break;

                          case 10:
                            _context46.prev = 10;
                            _context46.t0 = _context46["catch"](2);
                            errback(_context46.t0);

                          case 13:
                          case "end":
                            return _context46.stop();
                        }
                      }
                    }, _callee46, null, [[2, 10]]);
                  }));

                  return function (_x26, _x27, _x28) {
                    return _ref9.apply(this, arguments);
                  };
                }());

                _context47.next = 16;
                return this._protoo.request('join', {
                  displayName: this._displayName,
                  device: this._device,
                  rtpCapabilities: this._consume ? this._mediasoupDevice.rtpCapabilities : undefined,
                  sctpCapabilities: this._useDataChannel && this._consume ? this._mediasoupDevice.sctpCapabilities : undefined
                });

              case 16:
                _yield$this$_protoo$r = _context47.sent;
                peers = _yield$this$_protoo$r.peers;
                //推流步骤2 发送音频轨到服务端
                audio_track = stream.getAudioTracks()[0];
                _context47.next = 21;
                return this._sendTransport.produce({
                  track: audio_track,
                  codecOptions: {
                    opusStereo: 1,
                    opusDtx: 1
                  }
                });

              case 21:
                this._mixedAudioProducer = _context47.sent;

                this._mixedAudioProducer.on('transportclose', function () {
                  _this10._mixedAudioProducer = null;
                });

                this._mixedAudioProducer.on('trackended', function () {
                  _this10._mixedAudioProducer = null;
                }); //推流步骤 3、发送视频轨到服务端


                track = stream.getVideoTracks()[0];
                codecOptions = {
                  videoGoogleStartBitrate: 1000
                };
                codec = this._mediasoupDevice.rtpCapabilities.codecs.find(function (c) {
                  return c.mimeType.toLowerCase() === 'video/h264';
                });
                encodings = WEBCAM_SIMULCAST_ENCODINGS;
                _context47.next = 30;
                return this._sendTransport.produce({
                  track,
                  encodings,
                  codecOptions,
                  codec
                });

              case 30:
                this._mixedVideoProducer = _context47.sent;
                this.startRecord();

                this._mixedVideoProducer.on('transportclose', function () {
                  _this10._mixedVideoProducer = null;
                });

                this._mixedVideoProducer.on('trackended', function () {
                  _this10._mixedVideoProducer = null;
                });

                this._sendTransport.on('connectionstatechange', function (connectionState) {
                  if (connectionState === 'connected') {
                    _this10.enableChatDataProducer();

                    _this10.enableBotDataProducer();
                  }
                });

              case 35:
              case "end":
                return _context47.stop();
            }
          }
        }, _callee47, this);
      }));

      function _pushMixedStream(_x22) {
        return _pushMixedStream2.apply(this, arguments);
      }

      return _pushMixedStream;
    }()
  }, {
    key: "_joinRoom",
    value: function () {
      var _joinRoom2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee50() {
        var _this11 = this;

        var routerRtpCapabilities, transportInfo, id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, _transportInfo, _id6, _iceParameters2, _iceCandidates, _dtlsParameters, _sctpParameters, _yield$this$_protoo$r2, peers, _iterator3, _step3, peer;

        return _regenerator.default.wrap(function _callee50$(_context50) {
          while (1) {
            switch (_context50.prev = _context50.next) {
              case 0:
                this.handlerSuccessfulCallback('connect to signalserver successfully!'); //混流后 推到录制服务器

                if (!this.mixedStream) {
                  _context50.next = 4;
                  break;
                }

                this._pushMixedStream(this.mixedStream);

                return _context50.abrupt("return");

              case 4:
                _context50.prev = 4;
                this._mediasoupDevice = new mediasoupClient.Device({
                  handlerName: this._handlerName
                });
                _context50.next = 8;
                return this._protoo.request('getRouterRtpCapabilities');

              case 8:
                routerRtpCapabilities = _context50.sent;
                _context50.next = 11;
                return this._mediasoupDevice.load({
                  routerRtpCapabilities
                });

              case 11:
                if (!this._produce) {
                  _context50.next = 20;
                  break;
                }

                _context50.next = 14;
                return this._protoo.request('createWebRtcTransport', {
                  forceTcp: this._forceTcp,
                  producing: true,
                  consuming: false,
                  sctpCapabilities: this._useDataChannel ? this._mediasoupDevice.sctpCapabilities : undefined
                });

              case 14:
                transportInfo = _context50.sent;
                id = transportInfo.id, iceParameters = transportInfo.iceParameters, iceCandidates = transportInfo.iceCandidates, dtlsParameters = transportInfo.dtlsParameters, sctpParameters = transportInfo.sctpParameters;
                this._sendTransport = this._mediasoupDevice.createSendTransport({
                  id,
                  iceParameters,
                  iceCandidates,
                  dtlsParameters,
                  sctpParameters,
                  iceServers: [],
                  proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
                });

                this._sendTransport.on('connect', function (_ref10, callback, errback) // eslint-disable-line no-shadow
                {
                  var dtlsParameters = _ref10.dtlsParameters;

                  _this11._protoo.request('connectWebRtcTransport', {
                    transportId: _this11._sendTransport.id,
                    dtlsParameters
                  }).then(callback).catch(errback);
                });

                this._sendTransport.on('produce', /*#__PURE__*/function () {
                  var _ref12 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee48(_ref11, callback, errback) {
                    var kind, rtpParameters, appData, _yield$_this11$_proto, _id4;

                    return _regenerator.default.wrap(function _callee48$(_context48) {
                      while (1) {
                        switch (_context48.prev = _context48.next) {
                          case 0:
                            kind = _ref11.kind, rtpParameters = _ref11.rtpParameters, appData = _ref11.appData;
                            _context48.prev = 1;
                            _context48.next = 4;
                            return _this11._protoo.request('produce', {
                              transportId: _this11._sendTransport.id,
                              kind,
                              rtpParameters,
                              appData
                            });

                          case 4:
                            _yield$_this11$_proto = _context48.sent;
                            _id4 = _yield$_this11$_proto.id;
                            callback({
                              id: _id4
                            });
                            _context48.next = 12;
                            break;

                          case 9:
                            _context48.prev = 9;
                            _context48.t0 = _context48["catch"](1);
                            errback(_context48.t0);

                          case 12:
                          case "end":
                            return _context48.stop();
                        }
                      }
                    }, _callee48, null, [[1, 9]]);
                  }));

                  return function (_x29, _x30, _x31) {
                    return _ref12.apply(this, arguments);
                  };
                }());

                this._sendTransport.on('producedata', /*#__PURE__*/function () {
                  var _ref14 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee49(_ref13, callback, errback) {
                    var sctpStreamParameters, label, protocol, appData, _yield$_this11$_proto2, _id5;

                    return _regenerator.default.wrap(function _callee49$(_context49) {
                      while (1) {
                        switch (_context49.prev = _context49.next) {
                          case 0:
                            sctpStreamParameters = _ref13.sctpStreamParameters, label = _ref13.label, protocol = _ref13.protocol, appData = _ref13.appData;
                            console.debug('"producedata" event: [sctpStreamParameters:%o, appData:%o]', sctpStreamParameters, appData);
                            _context49.prev = 2;
                            _context49.next = 5;
                            return _this11._protoo.request('produceData', {
                              transportId: _this11._sendTransport.id,
                              sctpStreamParameters,
                              label,
                              protocol,
                              appData
                            });

                          case 5:
                            _yield$_this11$_proto2 = _context49.sent;
                            _id5 = _yield$_this11$_proto2.id;
                            callback({
                              id: _id5
                            });
                            _context49.next = 13;
                            break;

                          case 10:
                            _context49.prev = 10;
                            _context49.t0 = _context49["catch"](2);
                            errback(_context49.t0);

                          case 13:
                          case "end":
                            return _context49.stop();
                        }
                      }
                    }, _callee49, null, [[2, 10]]);
                  }));

                  return function (_x32, _x33, _x34) {
                    return _ref14.apply(this, arguments);
                  };
                }());

              case 20:
                if (!this._consume) {
                  _context50.next = 27;
                  break;
                }

                _context50.next = 23;
                return this._protoo.request('createWebRtcTransport', {
                  forceTcp: this._forceTcp,
                  producing: false,
                  consuming: true,
                  sctpCapabilities: this._useDataChannel ? this._mediasoupDevice.sctpCapabilities : undefined
                });

              case 23:
                _transportInfo = _context50.sent;
                _id6 = _transportInfo.id, _iceParameters2 = _transportInfo.iceParameters, _iceCandidates = _transportInfo.iceCandidates, _dtlsParameters = _transportInfo.dtlsParameters, _sctpParameters = _transportInfo.sctpParameters; // 用来接收数据

                this._recvTransport = this._mediasoupDevice.createRecvTransport({
                  id: _id6,
                  iceParameters: _iceParameters2,
                  iceCandidates: _iceCandidates,
                  dtlsParameters: _dtlsParameters,
                  sctpParameters: _sctpParameters,
                  iceServers: []
                });

                this._recvTransport.on('connect', function (_ref15, callback, errback) // eslint-disable-line no-shadow
                {
                  var dtlsParameters = _ref15.dtlsParameters;
                  console.debug("_recvTransport.on ('connect') callback: %s", callback);

                  _this11._protoo.request('connectWebRtcTransport', {
                    transportId: _this11._recvTransport.id,
                    dtlsParameters
                  }).then(callback).catch(errback);
                });

              case 27:
                _context50.next = 29;
                return this._protoo.request('join', {
                  displayName: this._displayName,
                  device: this._device,
                  rtpCapabilities: this._consume ? this._mediasoupDevice.rtpCapabilities : undefined,
                  sctpCapabilities: this._useDataChannel && this._consume ? this._mediasoupDevice.sctpCapabilities : undefined
                });

              case 29:
                _yield$this$_protoo$r2 = _context50.sent;
                peers = _yield$this$_protoo$r2.peers;
                // Join now into the room.
                // NOTE: Don't send our RTP capabilities if we don't want to consume.
                _iterator3 = _createForOfIteratorHelper(peers);

                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    peer = _step3.value;
                    console.debug("这是当前的peer: %o", peer);
                  } // Enable mic/webcam.

                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }

                if (!this._produce) {
                  _context50.next = 41;
                  break;
                }

                _context50.next = 36;
                return this.enableMic();

              case 36:
                _context50.next = 38;
                return this.enableWebcam();

              case 38:
                _context50.next = 40;
                return this.enableChatDataProducer();

              case 40:
                this._sendTransport.on('connectionstatechange', function (connectionState) {
                  console.debug("连接状态改变! :%s", connectionState);

                  if (connectionState === 'connected') {
                    _this11.enableChatDataProducer();

                    _this11.enableBotDataProducer();
                  }
                });

              case 41:
                _context50.next = 47;
                break;

              case 43:
                _context50.prev = 43;
                _context50.t0 = _context50["catch"](4);
                console.error('_joinRoom() failed:%o', _context50.t0);
                this.close();

              case 47:
              case "end":
                return _context50.stop();
            }
          }
        }, _callee50, this, [[4, 43]]);
      }));

      function _joinRoom() {
        return _joinRoom2.apply(this, arguments);
      }

      return _joinRoom;
    }()
  }, {
    key: "_updateWebcams",
    value: function () {
      var _updateWebcams2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee51() {
        var devices, _iterator4, _step4, device, array, len, currentWebcamId;

        return _regenerator.default.wrap(function _callee51$(_context51) {
          while (1) {
            switch (_context51.prev = _context51.next) {
              case 0:
                console.debug('_updateWebcams()'); // Reset the list.

                this._webcams = new Map();
                console.debug('_updateWebcams() | calling enumerateDevices()');
                _context51.next = 5;
                return navigator.mediaDevices.enumerateDevices();

              case 5:
                devices = _context51.sent;
                _iterator4 = _createForOfIteratorHelper(devices);
                _context51.prev = 7;

                _iterator4.s();

              case 9:
                if ((_step4 = _iterator4.n()).done) {
                  _context51.next = 16;
                  break;
                }

                device = _step4.value;

                if (!(device.kind !== 'videoinput')) {
                  _context51.next = 13;
                  break;
                }

                return _context51.abrupt("continue", 14);

              case 13:
                this._webcams.set(device.deviceId, device);

              case 14:
                _context51.next = 9;
                break;

              case 16:
                _context51.next = 21;
                break;

              case 18:
                _context51.prev = 18;
                _context51.t0 = _context51["catch"](7);

                _iterator4.e(_context51.t0);

              case 21:
                _context51.prev = 21;

                _iterator4.f();

                return _context51.finish(21);

              case 24:
                array = Array.from(this._webcams.values());
                len = array.length;
                currentWebcamId = this._webcam.device ? this._webcam.device.deviceId : undefined;
                console.debug('_updateWebcams() [webcams:%o]', array);
                if (len === 0) this._webcam.device = null;else if (!this._webcams.has(currentWebcamId)) this._webcam.device = array[0];

              case 29:
              case "end":
                return _context51.stop();
            }
          }
        }, _callee51, this, [[7, 18, 21, 24]]);
      }));

      function _updateWebcams() {
        return _updateWebcams2.apply(this, arguments);
      }

      return _updateWebcams;
    }()
  }, {
    key: "_getWebcamType",
    value: function _getWebcamType(device) {
      if (/(back|rear)/i.test(device.label)) {
        console.debug('_getWebcamType() | it seems to be a back camera');
        return 'back';
      } else {
        console.debug('_getWebcamType() | it seems to be a front camera');
        return 'front';
      }
    }
  }, {
    key: "_pauseConsumer",
    value: function () {
      var _pauseConsumer2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee52(consumer) {
        return _regenerator.default.wrap(function _callee52$(_context52) {
          while (1) {
            switch (_context52.prev = _context52.next) {
              case 0:
                if (!consumer.paused) {
                  _context52.next = 2;
                  break;
                }

                return _context52.abrupt("return");

              case 2:
                _context52.prev = 2;
                _context52.next = 5;
                return this._protoo.request('pauseConsumer', {
                  consumerId: consumer.id
                });

              case 5:
                consumer.pause();
                _context52.next = 11;
                break;

              case 8:
                _context52.prev = 8;
                _context52.t0 = _context52["catch"](2);
                console.error('_pauseConsumer() | failed:%o', _context52.t0);

              case 11:
              case "end":
                return _context52.stop();
            }
          }
        }, _callee52, this, [[2, 8]]);
      }));

      function _pauseConsumer(_x35) {
        return _pauseConsumer2.apply(this, arguments);
      }

      return _pauseConsumer;
    }()
  }, {
    key: "_resumeConsumer",
    value: function () {
      var _resumeConsumer2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee53(consumer) {
        return _regenerator.default.wrap(function _callee53$(_context53) {
          while (1) {
            switch (_context53.prev = _context53.next) {
              case 0:
                if (consumer.paused) {
                  _context53.next = 2;
                  break;
                }

                return _context53.abrupt("return");

              case 2:
                _context53.prev = 2;
                _context53.next = 5;
                return this._protoo.request('resumeConsumer', {
                  consumerId: consumer.id
                });

              case 5:
                consumer.resume();
                _context53.next = 11;
                break;

              case 8:
                _context53.prev = 8;
                _context53.t0 = _context53["catch"](2);
                console.error('_resumeConsumer() | failed:%o', _context53.t0);

              case 11:
              case "end":
                return _context53.stop();
            }
          }
        }, _callee53, this, [[2, 8]]);
      }));

      function _resumeConsumer(_x36) {
        return _resumeConsumer2.apply(this, arguments);
      }

      return _resumeConsumer;
    }()
  }, {
    key: "getMixedStream",
    value: function getMixedStream() {
      if (!this.localStream || !this.remoteStream) {
        console.error("请确保双向视频已经接通！");
        return;
      }

      if (this.mixedStream) {
        return this.mixedStream;
      }

      this.localStream.width = 320;
      this.localStream.height = 240;
      this.remoteStream.width = 320; // this.remoteStream.height = width/(height/320);

      this.remoteStream.height = 240;
      this.mixer = new _multistreamsmixer.default([this.localStream, this.remoteStream]);
      this.mixer.width = 640;
      this.mixer.height = 240;
      this.mixer.frameRate = 20;
      this.mixer.frameInterval = 50;
      this.mixer.startDrawingFrames();
      this.mixedStream = this.mixer.getMixedStream();
      return this.mixedStream;
    }
  }, {
    key: "makeAudioConstraints",
    value: function makeAudioConstraints() {
      var constraints = {};
      var audio = {};

      if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
        console.debug('the getSupportedConstraints is not supported!');
        audio = true;
      } else {
        var supportedConstraints = navigator.mediaDevices.getSupportedConstraints(); // add audio constraints
        // logger.debug(supportedConstraints);

        if (supportedConstraints.noiseSuppression) {
          audio.noiseSuppression = true; // 降噪

          audio.echoCancellation = true; //回音消除
        }

        if (supportedConstraints.autoGainControl) {// audio.autoGainControl = true; // 自增益
        }
      }

      constraints.audio = audio;
      return constraints;
    }
  }, {
    key: "makeVideoConstraints",
    value: function makeVideoConstraints() {
      var constraints = {};
      var video = {};

      if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
        console.debug('the getSupportedConstraints is not supported!');
        video = true;
      } else {
        var supportedConstraints = navigator.mediaDevices.getSupportedConstraints(); // add audio constraints
        // logger.debug(supportedConstraints);

        if (supportedConstraints.autoGainControl) {// audio.autoGainControl = true; // 自增益
        } // add video constraints


        if (supportedConstraints.width) {
          // 部分机型width,height为true任然不能设值
          video.width = this.videoWidth;
        }

        if (supportedConstraints.height) {
          video.height = this.videoHeight; // 2k 1920
        }

        if (supportedConstraints.facingMode) {
          video.facingMode = {
            ideal: 'user'
          }; // 前置/后置摄像头 user/environment 
        }

        if (supportedConstraints.frameRate) {
          video.frameRate = 20; // 帧率
        }
      }

      constraints.video = video;
      return constraints;
    }
  }]);
  return RoomClient;
}();

exports.RoomClient = RoomClient;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _bowser = _interopRequireDefault(require("bowser"));

// TODO: For testing.
// window.BOWSER = bowser;
function _default() {
  var ua = navigator.userAgent;

  var browser = _bowser.default.getParser(ua);

  var flag;
  if (browser.satisfies({
    chrome: '>=0',
    chromium: '>=0'
  })) flag = 'chrome';else if (browser.satisfies({
    firefox: '>=0'
  })) flag = 'firefox';else if (browser.satisfies({
    safari: '>=0'
  })) flag = 'safari';else if (browser.satisfies({
    opera: '>=0'
  })) flag = 'opera';else if (browser.satisfies({
    'microsoft edge': '>=0'
  })) flag = 'edge';else flag = 'unknown';
  return {
    flag,
    name: browser.getBrowserName(),
    version: browser.getBrowserVersion()
  };
}
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

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
    }

    if (supportedConstraints.echoCancellation) {
      audio.echoCancellation = true;
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
  var _ref = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(constraints) {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (s, j) {
              navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                s(stream);
              }).catch(function (err) {
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
  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (d, j) {
              navigator.mediaDevices.enumerateDevices().then(function (devices) {
                d(devices);
              }).catch(function (err) {
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
}; // module.exports = {gum,gud,normalVideoRenderHandler};
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var roomClient = null; // 双向视频接口

var recordClient = null; // 录制视频接口

var localStream = null; // 自己的视频流

var remoteStream = null; // 对端的视频流
// 按钮

var btnMakeCall = document.getElementById('makeCall');
var btnHangup = document.getElementById('hangup');
var btnSendMsg = document.getElementById('sendMsg');
{
  /* <button id="shareDesktop" disabled>分享桌面</button>
  <button id="mixDesktop" disabled>分享和摄像头</button>
  <button id="shareMp3" disabled>播报语音</button> */
}
var btnShareDesktop = document.getElementById('shareDesktop');
var btnMixDesktop = document.getElementById('mixDesktop');
var btnShareMp3 = document.getElementById('shareMp3'); // 视频控件

var videoLocal = document.getElementById('localVideo');
var videoRemote = document.getElementById('remoteVideo');
var videoMixed = document.getElementById('mixedVideo'); // 可选配置的变量

var g_roomName = 'name'; // const g_roomId = '12345611';

var g_videoWidth = 640;
var g_videoHeight = 480;
var g_protooUrl = "wss://szt.szkingdom.vip:4443/"; // const g_protooUrl = "wss://s1.chinalin.com:4443";
// const g_protooUrl = "wss://inward.szkingdom.vip:4443/";
// utils

var showStreamRatio = function showStreamRatio(stream) {
  var videoTrack = stream.getVideoTracks()[0];
  var videoSetting = videoTrack.getSettings();
  var height = videoSetting.height;
  var width = videoSetting.width;
  console.log("stream width height is: ", width, height);
};

var getMediaDevices = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
    var devices;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return gud();

          case 3:
            devices = _context.sent;
            _context.next = 9;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);

          case 9:
            return _context.abrupt("return", devices);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 6]]);
  }));

  return function getMediaDevices() {
    return _ref.apply(this, arguments);
  };
}();

var getLocalStream = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
    var devices, deviceId, stream, constraints;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return getMediaDevices();

          case 2:
            devices = _context2.sent;
            devices.forEach(function (element) {
              console.log(element);
            });
            devices.forEach(function (device) {
              if (device.kind.toLowerCase() == "videoinput") {
                console.log(device);
                deviceId = device.deviceId; // 指定摄像头
              }
            });
            _context2.prev = 5;
            constraints = makeConstraints(g_videoWidth, g_videoHeight, deviceId);
            _context2.next = 9;
            return gum(constraints);

          case 9:
            stream = _context2.sent;
            _context2.next = 18;
            break;

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2["catch"](5);
            console.error(_context2.t0);
            _context2.next = 17;
            return gum(DEFAULT_CONSTRAINTS);

          case 17:
            stream = _context2.sent;

          case 18:
            return _context2.abrupt("return", stream);

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[5, 12]]);
  }));

  return function getLocalStream() {
    return _ref2.apply(this, arguments);
  };
}(); // // 回调事件
// const handlerLStreamCallback = (localStream) => {
//     localStream = localStream;
//     videoLocal.srcObject = localStream;
//     btnMakeCall.disabled = true;
//     btnHangup.disabled = false;
//     btnShareDesktop.disabled = false;
//     btnMixDesktop.disabled = false;
//     btnShareMp3.disabled = false;
//     console.log('get localstream');
//     showStreamRatio(localStream);
// }


var handlerRStreamCallback = function handlerRStreamCallback(remoteStream) {
  remoteStream = remoteStream;
  videoRemote.srcObject = remoteStream;
  btnHangup.disabled = false;
  btnShareDesktop.disabled = false;
  btnMixDesktop.disabled = false;
  btnShareMp3.disabled = false;
  btnRecordServer.disabled = false;
  btnRecordLocal.disabled = false;
  console.log('get remotestream'); // showStreamRatio(remotestream);
};

var handlerChatDataCallback = function handlerChatDataCallback(msg) {
  var debugTextArea = document.getElementById("recvMsg");
  debugTextArea.value += 'recv:' + msg + '\n';
  debugTextArea.scrollTop = debugTextArea.scrollHeight;
};

var handlerErrorCallback = function handlerErrorCallback(err) {
  console.error(err);
};

var handlerSuccessfulCallback = function handlerSuccessfulCallback(msg) {
  console.log(msg);
};

var handlerActionCallback = function handlerActionCallback(msg) {
  // 对方连接断开指令
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
}; // 按钮事件


btnMakeCall.onclick = /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
  var storeCallback, roomId;
  return _regenerator.default.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return getLocalStream();

        case 2:
          localStream = _context3.sent;
          videoLocal.srcObject = localStream; // btnMakeCall.disabled = true;
          // btnHangup.disabled = false;

          storeCallback = new Object(); // storeCallback.handlerLStreamCallback = handlerLStreamCallback;

          storeCallback.handlerRStreamCallback = handlerRStreamCallback;
          storeCallback.handlerChatDataCallback = handlerChatDataCallback;
          storeCallback.handlerSuccessfulCallback = handlerSuccessfulCallback;
          storeCallback.handlerActionCallback = handlerActionCallback;

          if (roomClient) {
            roomClient.close();
            roomClient = null;
          }

          roomId = document.getElementById('roomid').value;
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
            datachannel: false,
            storeCallback: storeCallback
          });
          _context3.next = 14;
          return roomClient.join();

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
}));
btnHangup.onclick = /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
  return _regenerator.default.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
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

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
}));

btnSendMsg.onclick = function () {
  var text = document.getElementById("inputMsg").value;
  console.debug("发送文本消息: %s", text);
  roomClient.sendChatMessage(text);
  var debugTextArea = document.getElementById("recvMsg");
  debugTextArea.value += 'send:' + text + '\n';
  debugTextArea.scrollTop = debugTextArea.scrollHeight;
};

btnShareDesktop.onclick = /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
  return _regenerator.default.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          if (btnShareDesktop.textContent === '分享桌面') {
            roomClient.enableShareDesktop();
            btnShareDesktop.textContent = '结束分享';
          } else {
            roomClient.enableWebcam();
            btnShareDesktop.textContent = '分享桌面';
          }

        case 1:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5);
}));
btnMixDesktop.onclick = /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
  return _regenerator.default.wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6);
}));
btnShareMp3.onclick = /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
  return _regenerator.default.wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          // roomClient.enableShareMp3();
          getMp3Stream(function (track, duration) {
            roomClient.disableMic();
            roomClient.enableShareMp3(track, duration);
          });

        case 1:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7);
}));
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
    console.error(`${options.mimeType} is not supported!`);
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

btnRecordServer.onclick = /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
  return _regenerator.default.wrap(function _callee$(_context) {
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
"use strict";

function getMp3Stream(callback) {
  var selector = new FileSelector();
  selector.accept = '*.mp3';
  selector.selectSingleFile(function (mp3File) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var gainNode = context.createGain();
    gainNode.connect(context.destination);
    gainNode.gain.value = 0; // don't play for self

    var reader = new FileReader();

    reader.onload = function (e) {
      // Import callback function
      // provides PCM audio data decoded as an audio buffer
      context.decodeAudioData(e.target.result, createSoundSource);
    };

    reader.readAsArrayBuffer(mp3File);

    function createSoundSource(buffer) {
      var soundSource = context.createBufferSource();
      soundSource.buffer = buffer;
      soundSource.start(0, 0 / 1000);
      soundSource.connect(gainNode);
      var destination = context.createMediaStreamDestination();
      soundSource.connect(destination); // durtion=second*1000 (milliseconds)

      callback(destination.stream, buffer.duration * 1000);
    }
  }, function () {
    document.querySelector('#btn-get-mixed-stream').disabled = false;
    alert('Please select mp3 file.');
  });
}

function FileSelector() {
  var selector = this;

  var noFileSelectedCallback = function noFileSelectedCallback() {};

  selector.selectSingleFile = function (callback, failure) {
    if (failure) {
      noFileSelectedCallback = failure;
    }

    selectFile(callback);
  };

  selector.selectMultipleFiles = function (callback, failure) {
    if (failure) {
      noFileSelectedCallback = failure;
    }

    selectFile(callback, true);
  };

  selector.selectDirectory = function (callback, failure) {
    if (failure) {
      noFileSelectedCallback = failure;
    }

    selectFile(callback, true, true);
  };

  selector.accept = '*.*';

  function selectFile(callback, multiple, directory) {
    callback = callback || function () {};

    var file = document.createElement('input');
    file.type = 'file';

    if (multiple) {
      file.multiple = true;
    }

    if (directory) {
      file.webkitdirectory = true;
    }

    file.accept = selector.accept;

    file.onclick = function () {
      file.clickStarted = true;
    };

    document.body.onfocus = function () {
      setTimeout(function () {
        if (!file.clickStarted) return;
        file.clickStarted = false;

        if (!file.value) {
          noFileSelectedCallback();
        }
      }, 500);
    };

    file.onchange = function () {
      if (multiple) {
        if (!file.files.length) {
          console.error('No file selected.');
          return;
        }

        var arr = [];
        Array.from(file.files).forEach(function (file) {
          file.url = file.webkitRelativePath;
          arr.push(file);
        });
        callback(arr);
        return;
      }

      if (!file.files[0]) {
        console.error('No file selected.');
        return;
      }

      callback(file.files[0]);
      file.parentNode.removeChild(file);
    };

    file.style.display = 'none';
    (document.body || document.documentElement).appendChild(file);
    fireClickEvent(file);
  }

  function fireClickEvent(element) {
    if (typeof element.click === 'function') {
      element.click();
      return;
    }

    if (typeof element.change === 'function') {
      element.change();
      return;
    }

    if (typeof document.createEvent('Event') !== 'undefined') {
      var event = document.createEvent('Event');

      if (typeof event.initEvent === 'function' && typeof element.dispatchEvent === 'function') {
        event.initEvent('click', true, true);
        element.dispatchEvent(event);
        return;
      }
    }

    var event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
}
