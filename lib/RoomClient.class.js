import('@babel/polyfill');
import ('adapterjs');
// import('../node_modules/adapterjs/publish/adapter.screenshare.min')

import protooClient from 'protoo-client';
import * as mediasoupClient from 'mediasoup-client';
import deviceInfo from './deviceInfo';
import MultiStreamsMixer from 'multistreamsmixer';
import Logger from './Logger';
import randomString from 'random-string';
// import { gum, gud, normalVideoRenderHandler } from './gum';

const VIDEO_CONSTRAINS =
{
	qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
	vga: { width: { ideal: 640 }, height: { ideal: 480 } },
	hd: { width: { ideal: 1280 }, height: { ideal: 720 } }
};

const PC_PROPRIETARY_CONSTRAINTS =
{
	optional: [{ googDscp: true }]
};

// Used for simulcast webcam video.
// const WEBCAM_SIMULCAST_ENCODINGS =
// 	[
// 		{ scaleResolutionDownBy: 4, maxBitrate: 500000 },
// 		{ scaleResolutionDownBy: 2, maxBitrate: 1000000 },
// 		{ scaleResolutionDownBy: 1, maxBitrate: 5000000 }
// 	];
const WEBCAM_SIMULCAST_ENCODINGS =
	[
		// { scaleResolutionDownBy: 4, maxBitrate: 500000 },
		// { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
		{ scaleResolutionDownBy: 1, maxBitrate: 500000 }
	];

// Used for VP9 webcam video.
const WEBCAM_KSVC_ENCODINGS =
	[
		{ scalabilityMode: 'S3T3_KEY' }
	];

// Used for simulcast screen sharing.
const SCREEN_SHARING_SIMULCAST_ENCODINGS =
	[
		{ dtx: true, maxBitrate: 1500000 },
		{ dtx: true, maxBitrate: 6000000 }
	];

// Used for VP9 screen sharing.
const SCREEN_SHARING_SVC_ENCODINGS =
	[
		{ scalabilityMode: 'S3T3', dtx: true }
	];


const logger = new Logger('RoomClient');

export class RoomClient {

	constructor(
		{
			roomId,
			videoWidth,
			videoHeight,
			localStream,
			displayName,
			handlerName,
			useSimulcast,
			useSharingSimulcast,
			forceTcp,
			produce,
			consume,
			forceH264,
			forceVP9,
			svc,
			datachannel,
			protooUrl,
			storeCallback,
			mixedStream
		}
	) {
		this._device = deviceInfo();
		const peerId = randomString({ length: 16 }).toLowerCase();

		logger.debug(
			'constructor() [roomId:"%s", peerId:"%s", displayName:"%s", device:%s]',
			roomId, peerId, displayName, this._device.flag);

		// Closed flag.
		// @type {Boolean}
		this._closed = false;

		this.roomId = roomId;

		// Display name.
		// @type {String}
		this._displayName = displayName;

		// Whether we want to force RTC over TCP.
		// @type {Boolean}
		this._forceTcp = forceTcp;

		// Whether we want to produce audio/video.
		// @type {Boolean}
		this._produce = produce;

		// Whether we should consume.
		// @type {Boolean}
		this._consume = consume;

		// Whether we want DataChannels.
		// @type {Boolean}
		this._useDataChannel = datachannel;

		// Force H264 codec for sending.
		this._forceH264 = Boolean(forceH264);

		// Force VP9 codec for sending.
		this._forceVP9 = Boolean(forceVP9);

		// Next expected dataChannel test number.
		// @type {Number}
		this._nextDataChannelTestNumber = 0;

		// Custom mediasoup-client handler name (to override default browser
		// detection if desired).
		// @type {String}
		this._handlerName = handlerName;

		// Whether simulcast should be used.
		// @type {Boolean}
		this._useSimulcast = useSimulcast;

		// Whether simulcast should be used in desktop sharing.
		// @type {Boolean}
		this._useSharingSimulcast = useSharingSimulcast;

		// Protoo URL.
		// @type {String}
		this._protooUrl = protooUrl + "?roomId=" + roomId + "&peerId=" + peerId;

		// protoo-client Peer instance.
		// @type {protooClient.Peer}
		this._protoo = null;

		// mediasoup-client Device instance.
		// @type {mediasoupClient.Device}
		this._mediasoupDevice = null;

		// mediasoup Transport for sending.
		// @type {mediasoupClient.Transport}
		this._sendTransport = null;

		// mediasoup Transport for receiving.
		// @type {mediasoupClient.Transport}
		this._recvTransport = null;

		// Local mic mediasoup Producer.
		// @type {mediasoupClient.Producer}
		this._micProducer = null;

		// Local webcam mediasoup Producer.
		// @type {mediasoupClient.Producer}
		this._webcamProducer = null;

		// Local share mediasoup Producer.
		// @type {mediasoupClient.Producer}
		this._shareProducer = null;

		// Local chat DataProducer.
		// @type {mediasoupClient.DataProducer}
		this._chatDataProducer = null;

		// Local bot DataProducer.
		// @type {mediasoupClient.DataProducer}
		this._botDataProducer = null;

		// mediasoup Consumers.
		// @type {Map<String, mediasoupClient.Consumer>}
		this._consumers = new Map();

		// mediasoup DataConsumers.
		// @type {Map<String, mediasoupClient.DataConsumer>}
		this._dataConsumers = new Map();

		// Map of webcam MediaDeviceInfos indexed by deviceId.
		// @type {Map<String, MediaDeviceInfos>}
		this._webcams = new Map();

		// Local Webcam.
		// @type {Object} with:
		// - {MediaDeviceInfo} [device]
		// - {String} [resolution] - 'qvga' / 'vga' / 'hd'.
		this.video_constrains = { width: { ideal: videoWidth }, height: { ideal: videoHeight } };
		this._webcam =
		{
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
		this.mixedStream = mixedStream;
		// Set custom SVC scalability mode.
		if (svc) {
			WEBCAM_KSVC_ENCODINGS[0].scalabilityMode = `${svc}_KEY`;
			SCREEN_SHARING_SVC_ENCODINGS[0].scalabilityMode = svc;
		}
	}


	close() {
		if (this._closed)
			return;

		this._closed = true;

		logger.debug('close()');

		// Close protoo Peer
		this._protoo.close();

		// Close mediasoup Transports.
		if (this._sendTransport)
			this._sendTransport.close();

		if (this._recvTransport)
			this._recvTransport.close();

		this.disableMic();
		this.disableWebcam();
	}

	async startRecord() {
		if (!this._protoo) {
			logger.warn("There is no websocket connection !");
			return;
		}
		logger.debug("发送录制命令");
		const startRecordRes = await this._protoo.request(
			'start-record',
			{
				roomId: this.roomId
			});
		logger.debug(startRecordRes);
	}

	async stopRecord(callback) {
		this._recordCallback = callback;
		if (!this._protoo) {
			logger.warn("There is no websocket connection !");
			return;
		}
		const res = await this._protoo.request(
			'stop-record',
			{
				roomId: this.roomId
			});
		logger.debug(res);
		callback(res);
	}

	async join() {
		// 创建websockt通信,WebSocketTransport 是一种特殊处理过的websocket
		logger.debug("_protooUrl: %s", this._protooUrl);
		const protooTransport = new protooClient.WebSocketTransport(this._protooUrl);

		this._protoo = new protooClient.Peer(protooTransport);
		this._protoo.on('open', () => this._joinRoom());

		this._protoo.on('failed', () => {
			logger.error("protoo websocket failed !")
		});

		this._protoo.on('disconnected', () => {
			// Close mediasoup Transports.
			if (this._sendTransport) {
				this._sendTransport.close();
				this._sendTransport = null;
			}

			if (this._recvTransport) {
				this._recvTransport.close();
				this._recvTransport = null;
			}
		});

		this._protoo.on('close', () => {
			if (this._closed)
				return;

			this.close();
		});

		this._protoo.on('request', async (request, accept, reject) => {
			logger.debug(
				'proto "request" event [method:%s, data:%o]',
				request.method, request.data);

			switch (request.method) {

				case 'newConsumer':
					{

						if (!this._consume) {
							reject(403, 'I do not want to consume');

							break;
						}

						const {
							peerId,
							producerId,
							id,
							kind,
							rtpParameters,
							type,
							appData,
							producerPaused
						} = request.data;

						try {
							const consumer = await this._recvTransport.consume(
								{
									id,
									producerId,
									kind,
									rtpParameters,
									appData: { ...appData, peerId } // Trick.
								});
							logger.debug("创建新 consumer ...%o", consumer);
							// Store in the map.
							this._consumers.set(consumer.id, consumer);

							// this._remoteAudio.srcObject = new MediaStream(consumer.track);
							logger.debug("创建新的consumer.track:%o", consumer.track);
							if (!this.remoteStream) this.remoteStream = new MediaStream();
							this.remoteStream.addTrack(consumer.track);

							if (this.getRemoteStream) this.getRemoteStream(this.remoteStream);

							consumer.on('transportclose', () => {
								this._consumers.delete(consumer.id);
							});

							const { spatialLayers, temporalLayers } =
								mediasoupClient.parseScalabilityMode(
									consumer.rtpParameters.encodings[0].scalabilityMode);

							// We are ready. Answer the protoo request so the server will
							// resume this Consumer (which was paused for now if video).
							accept();

							// If audio-only mode is enabled, pause it.
							// if (consumer.kind === 'video')
							// 	this._pauseConsumer(consumer);
						}
						catch (error) {
							logger.error('"newConsumer" request failed:%o', error);

							throw error;
						}

						break;
					}

				case 'newDataConsumer':
					{
						if (!this._consume) {
							reject(403, 'I do not want to data consume');

							break;
						}

						if (!this._useDataChannel) {
							reject(403, 'I do not want DataChannels');

							break;
						}

						const {
							peerId, // NOTE: Null if bot.
							dataProducerId,
							id,
							sctpStreamParameters,
							label,
							protocol,
							appData
						} = request.data;

						try {
							const dataConsumer = await this._recvTransport.consumeData(
								{
									id,
									dataProducerId,
									sctpStreamParameters,
									label,
									protocol,
									appData: { ...appData, peerId } // Trick.
								});

							// Store in the map.
							this._dataConsumers.set(dataConsumer.id, dataConsumer);

							dataConsumer.on('transportclose', () => {
								this._dataConsumers.delete(dataConsumer.id);
							});

							dataConsumer.on('open', () => {
								// TODO: 开始文字聊天回调
								logger.debug('DataConsumer "open" event');
							});

							dataConsumer.on('close', () => {
								// TODO: 结束文字聊天回调
								logger.debug('DataConsumer "close" event');

								this._dataConsumers.delete(dataConsumer.id);
							});

							dataConsumer.on('error', (error) => {
								logger.error('DataConsumer "error" event:%o', error);

							});

							dataConsumer.on('message', (message) => {
								logger.debug(
									'DataConsumer "message" event [streamId:%d]',
									dataConsumer.sctpStreamParameters.streamId);

								if (message instanceof ArrayBuffer) {
									const view = new DataView(message);
									const number = view.getUint32();

									if (number == Math.pow(2, 32) - 1) {
										logger.warn('dataChannelTest finished!');

										this._nextDataChannelTestNumber = 0;

										return;
									}

									if (number > this._nextDataChannelTestNumber) {
										logger.warn(
											'dataChannelTest: %s packets missing',
											number - this._nextDataChannelTestNumber);
									}

									this._nextDataChannelTestNumber = number + 1;

									return;
								}
								else if (typeof message !== 'string') {
									logger.warn('ignoring DataConsumer "message" (not a string)');

									return;
								}

								switch (dataConsumer.label) {
									case 'chat':
										{
											logger.debug("data consumer label is chat !");

											this.onChatData(message);

											break;
										}

									case 'bot':
										{
											break;
										}
								}
							});


							// We are ready. Answer the protoo request.
							accept();
						}
						catch (error) {
							logger.error('"newDataConsumer" request failed:%o', error);
							throw error;
						}

						break;
					}
			}
		});

		this._protoo.on('notification', (notification) => {
			// logger.debug(
			// 	'proto "notification" event [method:%s, data:%o]',
			// 	notification.method, notification.data);

			switch (notification.method) {
				case 'producerScore':
					{
						const { producerId, score } = notification.data;
						break;
					}

				case 'newPeer':
					{
						const peer = notification.data;
						this.handlerActionCallback({
							action: 'other-connected',
							info: JSON.stringify(peer)
						});
						break;
					}

				case 'peerClosed':
					{
						const { peerId } = notification.data;
						this.handlerActionCallback({
							action: 'other-disconnect',
							info: peerId
						});
						break;
					}

				case 'peerDisplayNameChanged':
					{
						const { peerId, displayName, oldDisplayName } = notification.data;

						break;
					}

				case 'downlinkBwe':
					{
						logger.debug('\'downlinkBwe\' event:%o', notification.data);

						break;
					}

				case 'consumerClosed':
					{
						const { consumerId } = notification.data;
						const consumer = this._consumers.get(consumerId);

						if (!consumer)
							break;

						this.remoteStream.removeTrack(consumer.track);
						consumer.close();
						this._consumers.delete(consumerId);
						const { peerId } = consumer.appData;

						break;
					}

				case 'consumerPaused':
					{
						const { consumerId } = notification.data;
						const consumer = this._consumers.get(consumerId);

						if (!consumer)
							break;

						consumer.pause();

						break;
					}

				case 'consumerResumed':
					{
						const { consumerId } = notification.data;
						const consumer = this._consumers.get(consumerId);

						if (!consumer)
							break;

						consumer.resume();

						break;
					}

				case 'consumerLayersChanged':
					{
						const { consumerId, spatialLayer, temporalLayer } = notification.data;
						const consumer = this._consumers.get(consumerId);

						if (!consumer)
							break;
						break;
					}

				case 'consumerScore':
					{
						const { consumerId, score } = notification.data;
						break;
					}

				case 'dataConsumerClosed':
					{
						const { dataConsumerId } = notification.data;
						const dataConsumer = this._dataConsumers.get(dataConsumerId);

						if (!dataConsumer)
							break;

						dataConsumer.close();
						this._dataConsumers.delete(dataConsumerId);

						const { peerId } = dataConsumer.appData;
						break;
					}

				case 'activeSpeaker':
					{
						const { peerId } = notification.data;
						break;
					}

				default:
					{
						logger.error(
							'unknown protoo notification.method "%s"', notification.method);
					}
			}
		});
	}

	async enableMic() {
		logger.debug('enableMic()');

		if (this._micProducer)
			return;

		if (!this._mediasoupDevice.canProduce('audio')) {
			logger.error('enableMic() | cannot produce audio');
			return;
		}

		let track;

		try {
			logger.debug('enableMic() | calling getUserMedia()');

			track = this.localStream.getAudioTracks()[0];
			if (!this.localStream)
				this.localStream = new MediaStream();
			this.localStream.addTrack(track);

			this._micProducer = await this._sendTransport.produce(
				{
					track,
					codecOptions:
					{
						opusStereo: 1,
						opusDtx: 1
					}
					// NOTE: for testing codec selection.
					// codec : this._mediasoupDevice.rtpCapabilities.codecs
					// 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')
				});

			this._micProducer.on('transportclose', () => {
				this._micProducer = null;
			});

			this._micProducer.on('trackended', () => {

				this.disableMic()
					.catch(() => { });
			});
		}
		catch (error) {
			logger.error('enableMic() | failed:%o', error);

			if (track)
				track.stop();
		}
	}

	async enableShareMp3(trackMp3, duration) {
		logger.debug('enableMp3 , duration is ', duration);

		// if (this._micProducer) 
		// 	return;

		if (!this._micProducer) {
			logger.error('mic disabled');
			return;
		}

		if (!this._mediasoupDevice.canProduce('audio')) {
			logger.error('enableMic() | cannot produce audio');
			return;
		}

		let track;

		try {
			logger.debug('enableMic() | calling getUserMedia()');
			let cons = this.makeAudioConstraints();
			const stream = new MediaStream();

			stream.addTrack(this.localStream.getAudioTracks()[0]);

			var mp3Mixer = new MultiStreamsMixer([stream, trackMp3]);
			let mp3Stream = mp3Mixer.getMixedStream();
			track = mp3Stream.getAudioTracks()[0];
			this.localStream.addTrack(mp3Stream.getAudioTracks()[0]);
			this.getLocalStream(localStream);

			this._micProducer = await this._sendTransport.produce(
				{
					track,
					codecOptions:
					{
						opusStereo: 1,
						opusDtx: 1
					}
					// NOTE: for testing codec selection.
					// codec : this._mediasoupDevice.rtpCapabilities.codecs
					// 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')
				});

			this._micProducer.on('transportclose', () => {
				this._micProducer = null;
			});

			this._micProducer.on('trackended', () => {

				this.disableMic()
					.catch(() => { });
			});
		}
		catch (error) {
			logger.error('enableMic() | failed:%o', error);

			if (track)
				track.stop();
		}
	}

	async disableMic() {
		logger.debug('disableMic()');

		if (!this._micProducer)
			return;

		this._micProducer.close();
		this.localStream.getAudioTracks().forEach((track) => {
			// logger.log(track);
			this.localStream.removeTrack(track);
		});

		try {
			await this._protoo.request(
				'closeProducer', { producerId: this._micProducer.id });
		}
		catch (error) {
			logger.debug("this._protoo.request error ...")
		}

		this._micProducer = null;
	}

	async muteMic() {
		logger.debug('muteMic()');

		this._micProducer.pause();

		try {
			await this._protoo.request(
				'pauseProducer', { producerId: this._micProducer.id });

		}
		catch (error) {
			logger.error('muteMic() | failed: %o', error);
		}
	}

	async unmuteMic() {
		logger.debug('unmuteMic()');

		this._micProducer.resume();

		try {
			await this._protoo.request(
				'resumeProducer', { producerId: this._micProducer.id });
		}
		catch (error) {
			logger.error('unmuteMic() | failed: %o', error);
		}
	}

	async enableWebcam() {
		logger.debug("开始打开摄像头!!!!");
		if (this._webcamProducer)
			return;
		else if (this._shareProducer)
			await this.disableShareDesktop();

		if (!this._mediasoupDevice.canProduce('video')) {
			logger.error('enableWebcam() | cannot produce video');

			return;
		}

		let track;
		let device;

		try {

			await this._updateWebcams();
			device = this._webcam.device;

			const { resolution } = this._webcam;

			if (!device)
				throw new Error('no webcam devices');

			logger.debug('enableWebcam() | calling getUserMedia()');

			track = localStream.getVideoTracks()[0];
			let encodings;
			let codec;
			const codecOptions =
			{
				videoGoogleStartBitrate: 320
			};


			if (this._forceH264) {
				codec = this._mediasoupDevice.rtpCapabilities.codecs
					.find((c) => c.mimeType.toLowerCase() === 'video/h264');

				if (!codec) {
					throw new Error('desired H264 codec+configuration is not supported');
				}
			}
			else if (this._forceVP9) {
				codec = this._mediasoupDevice.rtpCapabilities.codecs
					.find((c) => c.mimeType.toLowerCase() === 'video/vp9');

				if (!codec) {
					throw new Error('desired VP9 codec+configuration is not supported');
				}
			}

			if (this._useSimulcast) {
				// If VP9 is the only available video codec then use SVC.
				const firstVideoCodec = this._mediasoupDevice
					.rtpCapabilities
					.codecs
					.find((c) => c.kind === 'video');

				if (
					(this._forceVP9 && codec) ||
					firstVideoCodec.mimeType.toLowerCase() === 'video/vp9'
				) {
					encodings = WEBCAM_KSVC_ENCODINGS;
				}
				else {
					encodings = WEBCAM_SIMULCAST_ENCODINGS;
				}
			}

			this._webcamProducer = await this._sendTransport.produce(
				{
					track,
					encodings,
					codecOptions,
					codec
				});

			this._webcamProducer.on('transportclose', () => {
				this._webcamProducer = null;
			});

			this._webcamProducer.on('trackended', () => {
				this.disableWebcam()
					.catch(() => { });
			});
			
		}
		catch (error) {
			logger.error('enableWebcam() | failed:%o', error);

			if (track)
				track.stop();
		}

	}

	async disableWebcam() {
		logger.debug('disableWebcam()');
		if (!this._webcamProducer)
			return;

		this._webcamProducer.close();

		this.localStream.getVideoTracks().forEach((track) => {
			// logger.log(track);
			this.localStream.removeTrack(track);
		});
		try {
			await this._protoo.request(
				'closeProducer', { producerId: this._webcamProducer.id });
		}
		catch (error) {
			logger.debug('disableWebcam() error !');
		}

		this._webcamProducer = null;
	}

	async changeWebcam() {
		logger.debug('changeWebcam()');

		try {
			await this._updateWebcams();

			const array = Array.from(this._webcams.keys());
			const len = array.length;
			const deviceId =
				this._webcam.device ? this._webcam.device.deviceId : undefined;
			let idx = array.indexOf(deviceId);

			if (idx < len - 1)
				idx++;
			else
				idx = 0;

			this._webcam.device = this._webcams.get(array[idx]);

			logger.debug(
				'changeWebcam() | new selected webcam [device:%o]',
				this._webcam.device);

			// Reset video resolution to HD.
			this._webcam.resolution = 'hd';

			if (!this._webcam.device)
				throw new Error('no webcam devices');

			// Closing the current video track before asking for a new one (mobiles do not like
			// having both front/back cameras open at the same time).
			this._webcamProducer.track.stop();

			logger.debug('changeWebcam() | calling getUserMedia()');

			const stream = await navigator.mediaDevices.getUserMedia(
				{
					video:
					{
						deviceId: { exact: this._webcam.device.deviceId },
						...VIDEO_CONSTRAINS[this._webcam.resolution]
					}
				});

			const track = stream.getVideoTracks()[0];

			await this._webcamProducer.replaceTrack({ track });
		}
		catch (error) {
			logger.error('changeWebcam() | failed: %o', error);
		}
	}

	async changeWebcamResolution() {
		logger.debug('changeWebcamResolution()');

		try {
			switch (this._webcam.resolution) {
				case 'qvga':
					this._webcam.resolution = 'vga';
					break;
				case 'vga':
					this._webcam.resolution = 'hd';
					break;
				case 'hd':
					this._webcam.resolution = 'qvga';
					break;
				default:
					this._webcam.resolution = 'hd';
			}

			logger.debug('changeWebcamResolution() | calling getUserMedia()');

			const stream = await navigator.mediaDevices.getUserMedia(
				{
					video:
					{
						deviceId: { exact: this._webcam.device.deviceId },
						...VIDEO_CONSTRAINS[this._webcam.resolution]
					}
				});

			const track = stream.getVideoTracks()[0];

			await this._webcamProducer.replaceTrack({ track });

		}
		catch (error) {
			logger.error('changeWebcamResolution() | failed: %o', error);
		}

	}

	async enableShareDesktop() {
		logger.debug('enableShareDesktop()');

		if (this._shareProducer)
			return;
		else if (this._webcamProducer)
			await this.disableWebcam();

		if (!this._mediasoupDevice.canProduce('video')) {
			logger.error('enableShareDesktop() | cannot produce video');

			return;
		}

		let track;

		try {
			logger.debug('enableShareDesktop() | calling getUserMedia()');

			const stream = await navigator.mediaDevices.getDisplayMedia(
				{
					audio: false,
					video:
					{
						displaySurface: 'monitor',
						logicalSurface: true,
						cursor: true,
						// width: { max: 1920 },
						// height: { max: 1080 },
						frameRate: { max: 20 }
					}
				});

			// May mean cancelled (in some implementations).
			if (!stream) {
				return;
			}

			track = stream.getVideoTracks()[0];

			let encodings;
			let codec;
			const codecOptions =
			{
				videoGoogleStartBitrate: 1000
			};

			if (this._forceH264) {
				codec = this._mediasoupDevice.rtpCapabilities.codecs
					.find((c) => c.mimeType.toLowerCase() === 'video/h264');

				if (!codec) {
					throw new Error('desired H264 codec+configuration is not supported');
				}
			}
			else if (this._forceVP9) {
				codec = this._mediasoupDevice.rtpCapabilities.codecs
					.find((c) => c.mimeType.toLowerCase() === 'video/vp9');

				if (!codec) {
					throw new Error('desired VP9 codec+configuration is not supported');
				}
			}

			if (this._useSharingSimulcast) {
				// If VP9 is the only available video codec then use SVC.
				const firstVideoCodec = this._mediasoupDevice
					.rtpCapabilities
					.codecs
					.find((c) => c.kind === 'video');

				if (
					(this._forceVP9 && codec) ||
					firstVideoCodec.mimeType.toLowerCase() === 'video/vp9'
				) {
					encodings = SCREEN_SHARING_SVC_ENCODINGS;
				}
				else {
					encodings = SCREEN_SHARING_SIMULCAST_ENCODINGS
						.map((encoding) => ({ ...encoding, dtx: true }));
				}
			}

			this._shareProducer = await this._sendTransport.produce(
				{
					track,
					encodings,
					codecOptions,
					codec,
					appData:
					{
						share: true
					}
				});

			this._shareProducer.on('transportclose', () => {
				this._shareProducer = null;
			});

			this._shareProducer.on('trackended', () => {
				this.disableShareDesktop()
					.catch(() => { });
			});
		}
		catch (error) {
			logger.error('enableShareDesktop() | failed:%o', error);

			if (error.name !== 'NotAllowedError') {

			}

			if (track)
				track.stop();
		}
	}

	async disableShareDesktop() {
		logger.debug('disableShareDesktop()');

		if (!this._shareProducer)
			return;

		this._shareProducer.close();

		// this.localStream.removeTrack(this.localStream.getVideoTracks());
		try {
			await this._protoo.request(
				'closeProducer', { producerId: this._shareProducer.id });
		}
		catch (error) {
			logger.error("disableShareDesktop() error !")
		}

		this._shareProducer = null;
	}

	async enableAudioOnly() {
		logger.debug('enableAudioOnly()');

		this.disableWebcam();

		for (const consumer of this._consumers.values()) {
			if (consumer.kind !== 'video')
				continue;

			this._pauseConsumer(consumer);
		}
	}

	async disableAudioOnly() {
		logger.debug('disableAudioOnly()');

		if (
			!this._webcamProducer &&
			this._produce &&
			(cookiesManager.getDevices() || {}).webcamEnabled
		) {
			this.enableWebcam();
		}

		for (const consumer of this._consumers.values()) {
			if (consumer.kind !== 'video')
				continue;

			this._resumeConsumer(consumer);
		}
	}

	async muteAudio() {
		logger.debug('muteAudio()');
	}

	async unmuteAudio() {
		logger.debug('unmuteAudio()');
	}

	async restartIce() {
		logger.debug('restartIce()');

		try {
			if (this._sendTransport) {
				const iceParameters = await this._protoo.request(
					'restartIce',
					{ transportId: this._sendTransport.id });

				await this._sendTransport.restartIce({ iceParameters });
			}

			if (this._recvTransport) {
				const iceParameters = await this._protoo.request(
					'restartIce',
					{ transportId: this._recvTransport.id });

				await this._recvTransport.restartIce({ iceParameters });
			}
		}
		catch (error) {
			logger.error('restartIce() | failed:%o', error);
		}
	}

	async setMaxSendingSpatialLayer(spatialLayer) {
		logger.debug('setMaxSendingSpatialLayer() [spatialLayer:%s]', spatialLayer);

		try {
			if (this._webcamProducer)
				await this._webcamProducer.setMaxSpatialLayer(spatialLayer);
			else if (this._shareProducer)
				await this._shareProducer.setMaxSpatialLayer(spatialLayer);
		}
		catch (error) {
			logger.error('setMaxSendingSpatialLayer() | failed:%o', error);

		}
	}

	async setConsumerPreferredLayers(consumerId, spatialLayer, temporalLayer) {
		logger.debug(
			'setConsumerPreferredLayers() [consumerId:%s, spatialLayer:%s, temporalLayer:%s]',
			consumerId, spatialLayer, temporalLayer);

		try {
			await this._protoo.request(
				'setConsumerPreferredLayers', { consumerId, spatialLayer, temporalLayer });

		}
		catch (error) {
			logger.error('setConsumerPreferredLayers() | failed:%o', error);
		}
	}

	async setConsumerPriority(consumerId, priority) {
		logger.debug(
			'setConsumerPriority() [consumerId:%s, priority:%d]',
			consumerId, priority);

		try {
			await this._protoo.request('setConsumerPriority', { consumerId, priority });
		}
		catch (error) {
			logger.error('setConsumerPriority() | failed:%o', error);
		}
	}

	async requestConsumerKeyFrame(consumerId) {
		logger.debug('requestConsumerKeyFrame() [consumerId:%s]', consumerId);

		try {
			await this._protoo.request('requestConsumerKeyFrame', { consumerId });

		}
		catch (error) {
			logger.error('requestConsumerKeyFrame() | failed:%o', error);
		}
	}

	async enableChatDataProducer() {
		logger.debug('enableChatDataProducer()');

		if (!this._useDataChannel)
			return;

		// NOTE: Should enable this code but it's useful for testing.
		// if (this._chatDataProducer)
		// 	return;

		try {
			// Create chat DataProducer.
			this._chatDataProducer = await this._sendTransport.produceData(
				{
					ordered: false,
					maxRetransmits: 1,
					label: 'chat',
					priority: 'medium',
					appData: { info: 'my-chat-DataProducer' }
				});

			this._chatDataProducer.on('transportclose', () => {
				this._chatDataProducer = null;
				this.handlerActionCallback({ action: 'chatclosed' });
			});

			this._chatDataProducer.on('open', () => {
				logger.debug('chat DataProducer "open" event');
			});

			this._chatDataProducer.on('close', () => {
				logger.error('chat DataProducer "close" event');

				this._chatDataProducer = null;
			});

			this._chatDataProducer.on('error', (error) => {
				logger.error('chat DataProducer "error" event:%o', error);
			});

			this._chatDataProducer.on('bufferedamountlow', () => {
				logger.debug('chat DataProducer "bufferedamountlow" event');
			});
		}
		catch (error) {
			logger.error('enableChatDataProducer() | failed:%o', error);

			throw error;
		}
	}

	async enableBotDataProducer() {
		logger.debug('enableBotDataProducer()');

		if (!this._useDataChannel)
			return;

		// NOTE: Should enable this code but it's useful for testing.
		// if (this._botDataProducer)
		// 	return;

		try {
			// Create chat DataProducer.
			this._botDataProducer = await this._sendTransport.produceData(
				{
					ordered: false,
					maxPacketLifeTime: 2000,
					label: 'bot',
					priority: 'medium',
					appData: { info: 'my-bot-DataProducer' }
				});

			this._botDataProducer.on('transportclose', () => {
				this._botDataProducer = null;
			});

			this._botDataProducer.on('open', () => {
				logger.debug('bot DataProducer "open" event');
			});

			this._botDataProducer.on('close', () => {
				logger.error('bot DataProducer "close" event');

				this._botDataProducer = null;
			});

			this._botDataProducer.on('error', (error) => {
				logger.error('bot DataProducer "error" event:%o', error);
			});

			this._botDataProducer.on('bufferedamountlow', () => {
				logger.debug('bot DataProducer "bufferedamountlow" event');
			});
		}
		catch (error) {
			logger.error('enableBotDataProducer() | failed:%o', error);

			throw error;
		}
	}

	async sendChatMessage(text) {
		logger.debug('sendChatMessage() [text:"%s]', text);

		if (!this._chatDataProducer) {

			return;
		}

		try {
			this._chatDataProducer.send(text);
		}
		catch (error) {
			logger.error('chat DataProducer.send() failed:%o', error);
		}
	}

	async sendBotMessage(text) {
		logger.debug('sendBotMessage() [text:"%s]', text);

		if (!this._botDataProducer) {
			return;
		}

		try {
			this._botDataProducer.send(text);
		}
		catch (error) {
			logger.error('bot DataProducer.send() failed:%o', error);
		}
	}

	async changeDisplayName(displayName) {
		logger.debug('changeDisplayName() [displayName:"%s"]', displayName);

		// Store in cookie.
		cookiesManager.setUser({ displayName });

		try {
			await this._protoo.request('changeDisplayName', { displayName });

			this._displayName = displayName;
		}
		catch (error) {
			logger.error('changeDisplayName() | failed: %o', error);
		}
	}

	async getSendTransportRemoteStats() {
		logger.debug('getSendTransportRemoteStats()');

		if (!this._sendTransport)
			return;

		return this._protoo.request(
			'getTransportStats', { transportId: this._sendTransport.id });
	}

	async getRecvTransportRemoteStats() {
		logger.debug('getRecvTransportRemoteStats()');

		if (!this._recvTransport)
			return;

		return this._protoo.request(
			'getTransportStats', { transportId: this._recvTransport.id });
	}

	async getAudioRemoteStats() {
		logger.debug('getAudioRemoteStats()');

		if (!this._micProducer)
			return;

		return this._protoo.request(
			'getProducerStats', { producerId: this._micProducer.id });
	}

	async getVideoRemoteStats() {
		logger.debug('getVideoRemoteStats()');

		const producer = this._webcamProducer || this._shareProducer;

		if (!producer)
			return;

		return this._protoo.request(
			'getProducerStats', { producerId: producer.id });
	}

	async getConsumerRemoteStats(consumerId) {
		logger.debug('getConsumerRemoteStats()');

		const consumer = this._consumers.get(consumerId);

		if (!consumer)
			return;

		return this._protoo.request('getConsumerStats', { consumerId });
	}

	async getChatDataProducerRemoteStats() {
		logger.debug('getChatDataProducerRemoteStats()');

		const dataProducer = this._chatDataProducer;

		if (!dataProducer)
			return;

		return this._protoo.request(
			'getDataProducerStats', { dataProducerId: dataProducer.id });
	}

	async getBotDataProducerRemoteStats() {
		logger.debug('getBotDataProducerRemoteStats()');

		const dataProducer = this._botDataProducer;

		if (!dataProducer)
			return;

		return this._protoo.request(
			'getDataProducerStats', { dataProducerId: dataProducer.id });
	}

	async getDataConsumerRemoteStats(dataConsumerId) {
		logger.debug('getDataConsumerRemoteStats()');

		const dataConsumer = this._dataConsumers.get(dataConsumerId);

		if (!dataConsumer)
			return;

		return this._protoo.request('getDataConsumerStats', { dataConsumerId });
	}

	async getSendTransportLocalStats() {
		logger.debug('getSendTransportLocalStats()');

		if (!this._sendTransport)
			return;

		return this._sendTransport.getStats();
	}

	async getRecvTransportLocalStats() {
		logger.debug('getRecvTransportLocalStats()');

		if (!this._recvTransport)
			return;

		return this._recvTransport.getStats();
	}

	async getAudioLocalStats() {
		logger.debug('getAudioLocalStats()');

		if (!this._micProducer)
			return;

		return this._micProducer.getStats();
	}

	async getVideoLocalStats() {
		logger.debug('getVideoLocalStats()');

		const producer = this._webcamProducer || this._shareProducer;

		if (!producer)
			return;

		return producer.getStats();
	}

	async getConsumerLocalStats(consumerId) {
		const consumer = this._consumers.get(consumerId);

		if (!consumer)
			return;

		return consumer.getStats();
	}

	async applyNetworkThrottle({ uplink, downlink, rtt, secret }) {
		logger.debug(
			'applyNetworkThrottle() [uplink:%s, downlink:%s, rtt:%s]',
			uplink, downlink, rtt);

		try {
			await this._protoo.request(
				'applyNetworkThrottle',
				{ uplink, downlink, rtt, secret });
		}
		catch (error) {
			logger.error('applyNetworkThrottle() | failed:%o', error);
		}
	}

	async resetNetworkThrottle({ silent = false, secret }) {
		logger.debug('resetNetworkThrottle()');

		try {
			await this._protoo.request('resetNetworkThrottle', { secret });
		}
		catch (error) {
			if (!silent) {
				logger.error('resetNetworkThrottle() | failed:%o', error);
			}
		}
	}
	async _pushMixedStream(stream) {
		this._mediasoupDevice = new mediasoupClient.Device(
			{
				handlerName: this._handlerName
			});
		const routerRtpCapabilities = await this._protoo.request('getRouterRtpCapabilities');

		await this._mediasoupDevice.load({ routerRtpCapabilities });

		//推流步骤 1、创建 _sendTransport
		const transportInfo = await this._protoo.request(
			'createWebRtcTransport',
			{
				forceTcp: this._forceTcp,
				producing: true,
				consuming: false,
				sctpCapabilities: this._useDataChannel
					? this._mediasoupDevice.sctpCapabilities
					: undefined
			});

		const {
			id,
			iceParameters,
			iceCandidates,
			dtlsParameters,
			sctpParameters
		} = transportInfo;

		this._sendTransport = this._mediasoupDevice.createSendTransport(
			{
				id,
				iceParameters,
				iceCandidates,
				dtlsParameters,
				sctpParameters,
				iceServers: [],
				proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
			});

		this._sendTransport.on(
			'connect', ({ dtlsParameters }, callback, errback) => // eslint-disable-line no-shadow
		{
			this._protoo.request(
				'connectWebRtcTransport',
				{
					transportId: this._sendTransport.id,
					dtlsParameters
				})
				.then(callback)
				.catch(errback);
		});

		this._sendTransport.on(
			'produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
				try {
					// eslint-disable-next-line no-shadow
					const { id } = await this._protoo.request(
						'produce',
						{
							transportId: this._sendTransport.id,
							kind,
							rtpParameters,
							appData
						});

					callback({ id });
				}
				catch (error) {
					errback(error);
				}
			});

		this._sendTransport.on('producedata', async (
			{
				sctpStreamParameters,
				label,
				protocol,
				appData
			},
			callback,
			errback
		) => {
			logger.debug(
				'"producedata" event: [sctpStreamParameters:%o, appData:%o]',
				sctpStreamParameters, appData);

			try {
				// eslint-disable-next-line no-shadow
				const { id } = await this._protoo.request(
					'produceData',
					{
						transportId: this._sendTransport.id,
						sctpStreamParameters,
						label,
						protocol,
						appData
					});

				callback({ id });
			}
			catch (error) {
				errback(error);
			}
		});
		const { peers } = await this._protoo.request(
			'join',
			{
				displayName: this._displayName,
				device: this._device,
				rtpCapabilities: this._consume
					? this._mediasoupDevice.rtpCapabilities
					: undefined,
				sctpCapabilities: this._useDataChannel && this._consume
					? this._mediasoupDevice.sctpCapabilities
					: undefined
			});

		//推流步骤2 发送音频轨到服务端
		let audio_track = stream.getAudioTracks()[0];

		this._mixedAudioProducer = await this._sendTransport.produce(
			{
				track: audio_track,
				codecOptions:
				{
					opusStereo: 1,
					opusDtx: 1
				}
			});

		this._mixedAudioProducer.on('transportclose', () => {
			this._mixedAudioProducer = null;
		});

		this._mixedAudioProducer.on('trackended', () => {
			this._mixedAudioProducer = null;
		});

		//推流步骤 3、发送视频轨到服务端
		let track = stream.getVideoTracks()[0];
		let encodings;
		let codec;
		const codecOptions =
		{
			videoGoogleStartBitrate: 1000
		};
		codec = this._mediasoupDevice.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/h264');

		encodings = WEBCAM_SIMULCAST_ENCODINGS;

		this._mixedVideoProducer = await this._sendTransport.produce(
			{
				track,
				encodings,
				codecOptions,
				codec
			});
		this.startRecord();

		this._mixedVideoProducer.on('transportclose', () => {
			this._mixedVideoProducer = null;
		});

		this._mixedVideoProducer.on('trackended', () => {
			this._mixedVideoProducer = null;
		});


		this._sendTransport.on('connectionstatechange', (connectionState) => {
			if (connectionState === 'connected') {
				this.enableChatDataProducer();
				this.enableBotDataProducer();
			}
		});
	}
	async _joinRoom() {
		this.handlerSuccessfulCallback('connect to signalserver successfully!');
		//混流后 推到录制服务器
		if (this.mixedStream) {
			this._pushMixedStream(this.mixedStream);
			return;
		}
		try {
			this._mediasoupDevice = new mediasoupClient.Device(
				{
					handlerName: this._handlerName
				});

			const routerRtpCapabilities =
				await this._protoo.request('getRouterRtpCapabilities');

			await this._mediasoupDevice.load({ routerRtpCapabilities });

			// NOTE: Stuff to play remote audios due to browsers' new autoplay policy.
			// Just get access to the mic and DO NOT close the mic track for a while.
			// Super hack!
			// {
			// 	const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			// 	const audioTrack = stream.getAudioTracks()[0];

			// 	audioTrack.enabled = false;

			// 	setTimeout(() => audioTrack.stop(), 1000);
			// }
			// Create mediasoup Transport for sending (unless we don't want to produce).
			if (this._produce) {
				const transportInfo = await this._protoo.request(
					'createWebRtcTransport',
					{
						forceTcp: this._forceTcp,
						producing: true,
						consuming: false,
						sctpCapabilities: this._useDataChannel
							? this._mediasoupDevice.sctpCapabilities
							: undefined
					});

				const {
					id,
					iceParameters,
					iceCandidates,
					dtlsParameters,
					sctpParameters
				} = transportInfo;

				this._sendTransport = this._mediasoupDevice.createSendTransport(
					{
						id,
						iceParameters,
						iceCandidates,
						dtlsParameters,
						sctpParameters,
						iceServers: [],
						proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
					});

				this._sendTransport.on(
					'connect', ({ dtlsParameters }, callback, errback) => // eslint-disable-line no-shadow
				{
					this._protoo.request(
						'connectWebRtcTransport',
						{
							transportId: this._sendTransport.id,
							dtlsParameters
						})
						.then(callback)
						.catch(errback);
				});

				this._sendTransport.on(
					'produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
						try {
							// eslint-disable-next-line no-shadow
							const { id } = await this._protoo.request(
								'produce',
								{
									transportId: this._sendTransport.id,
									kind,
									rtpParameters,
									appData
								});

							callback({ id });
						}
						catch (error) {
							errback(error);
						}
					});

				this._sendTransport.on('producedata', async (
					{
						sctpStreamParameters,
						label,
						protocol,
						appData
					},
					callback,
					errback
				) => {
					logger.debug(
						'"producedata" event: [sctpStreamParameters:%o, appData:%o]',
						sctpStreamParameters, appData);

					try {
						// eslint-disable-next-line no-shadow
						const { id } = await this._protoo.request(
							'produceData',
							{
								transportId: this._sendTransport.id,
								sctpStreamParameters,
								label,
								protocol,
								appData
							});

						callback({ id });
					}
					catch (error) {
						errback(error);
					}
				});
			}

			/*
				logger.debug(
				'proto "notification" event [method:%s, data:%o]',
				notification.method, notification.data);
			*/
			// Create mediasoup Transport for receiving (unless we don't want to consume).
			if (this._consume) {
				const transportInfo = await this._protoo.request(
					'createWebRtcTransport',
					{
						forceTcp: this._forceTcp,
						producing: false,
						consuming: true,
						sctpCapabilities: this._useDataChannel
							? this._mediasoupDevice.sctpCapabilities
							: undefined
					});

				const {
					id,
					iceParameters,
					iceCandidates,
					dtlsParameters,
					sctpParameters
				} = transportInfo;

				// 用来接收数据
				this._recvTransport = this._mediasoupDevice.createRecvTransport(
					{
						id,
						iceParameters,
						iceCandidates,
						dtlsParameters,
						sctpParameters,
						iceServers: []
					});

				this._recvTransport.on(
					'connect', ({ dtlsParameters }, callback, errback) => // eslint-disable-line no-shadow
				{
					logger.debug("_recvTransport.on ('connect') callback: %s", callback);
					this._protoo.request(
						'connectWebRtcTransport',
						{
							transportId: this._recvTransport.id,
							dtlsParameters
						})
						.then(callback)
						.catch(errback);
				});
			}

			const { peers } = await this._protoo.request(
				'join',
				{
					displayName: this._displayName,
					device: this._device,
					rtpCapabilities: this._consume
						? this._mediasoupDevice.rtpCapabilities
						: undefined,
					sctpCapabilities: this._useDataChannel && this._consume
						? this._mediasoupDevice.sctpCapabilities
						: undefined
				});

			// Join now into the room.
			// NOTE: Don't send our RTP capabilities if we don't want to consume.
			for (const peer of peers) {
				logger.debug("这是当前的peer: %o", peer);
			}

			// Enable mic/webcam.
			if (this._produce) {

				await this.enableMic();
				await this.enableWebcam();

				await this.enableChatDataProducer();

				this._sendTransport.on('connectionstatechange', (connectionState) => {
					logger.debug("连接状态改变! :%s", connectionState);
					if (connectionState === 'connected') {
						this.enableChatDataProducer();
						this.enableBotDataProducer();
					}
				});
			}
		}
		catch (error) {
			logger.error('_joinRoom() failed:%o', error);

			this.close();
		}
	}

	async _updateWebcams() {
		logger.debug('_updateWebcams()');

		// Reset the list.
		this._webcams = new Map();

		logger.debug('_updateWebcams() | calling enumerateDevices()');

		const devices = await navigator.mediaDevices.enumerateDevices();

		for (const device of devices) {
			if (device.kind !== 'videoinput')
				continue;

			this._webcams.set(device.deviceId, device);
		}

		const array = Array.from(this._webcams.values());
		const len = array.length;
		const currentWebcamId =
			this._webcam.device ? this._webcam.device.deviceId : undefined;

		logger.debug('_updateWebcams() [webcams:%o]', array);

		if (len === 0)
			this._webcam.device = null;
		else if (!this._webcams.has(currentWebcamId))
			this._webcam.device = array[0];
	}

	_getWebcamType(device) {
		if (/(back|rear)/i.test(device.label)) {
			logger.debug('_getWebcamType() | it seems to be a back camera');

			return 'back';
		}
		else {
			logger.debug('_getWebcamType() | it seems to be a front camera');

			return 'front';
		}
	}

	async _pauseConsumer(consumer) {
		if (consumer.paused)
			return;

		try {
			await this._protoo.request('pauseConsumer', { consumerId: consumer.id });

			consumer.pause();
		}
		catch (error) {
			logger.error('_pauseConsumer() | failed:%o', error);
		}
	}

	async _resumeConsumer(consumer) {
		if (!consumer.paused)
			return;

		try {
			await this._protoo.request('resumeConsumer', { consumerId: consumer.id });

			consumer.resume();
		}
		catch (error) {
			logger.error('_resumeConsumer() | failed:%o', error);
		}
	}

	getMixedStream() {
		if (!this.localStream || !this.remoteStream) {
			logger.error("请确保双向视频已经接通！");
			return;
		}
		if (this.mixedStream) {
			return this.mixedStream;
		}
		this.localStream.width = 320;
		this.localStream.height = 240;
		this.remoteStream.width = 320;
		// this.remoteStream.height = width/(height/320);
		this.remoteStream.height = 240;

		this.mixer = new MultiStreamsMixer([this.localStream, this.remoteStream]);

		this.mixer.width = 640;
		this.mixer.height = 240;
		this.mixer.frameRate = 20;
		this.mixer.frameInterval = 50;

		this.mixer.startDrawingFrames();
		this.mixedStream = this.mixer.getMixedStream();
		return this.mixedStream;
	}

	makeAudioConstraints() {
		let constraints = {};
		let audio = {};
		if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
			logger.debug('the getSupportedConstraints is not supported!');
			audio = true;
		}
		else {
			let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
			// add audio constraints
			// logger.debug(supportedConstraints);
			if (supportedConstraints.noiseSuppression) {
				audio.noiseSuppression = true;  // 降噪
				audio.echoCancellation = true;  //回音消除
			}
			if (supportedConstraints.autoGainControl) {
				// audio.autoGainControl = true; // 自增益
			}

		}

		constraints.audio = audio;
		return constraints;
	}

	makeVideoConstraints() {
		let constraints = {};
		let video = {};
		if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
			logger.debug('the getSupportedConstraints is not supported!');
			video = true;
		}
		else {
			let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
			// add audio constraints
			// logger.debug(supportedConstraints);
			if (supportedConstraints.autoGainControl) {
				// audio.autoGainControl = true; // 自增益
			}

			// add video constraints
			if (supportedConstraints.width) { // 部分机型width,height为true任然不能设值
				video.width = this.videoWidth;
			}
			if (supportedConstraints.height) {
				video.height = this.videoHeight; // 2k 1920
			}
			if (supportedConstraints.facingMode) {
				video.facingMode = { ideal: 'user' }; // 前置/后置摄像头 user/environment 
			}
			if (supportedConstraints.frameRate) {
				video.frameRate = 20; // 帧率
			}
		}

		constraints.video = video;
		return constraints;
	}
}
