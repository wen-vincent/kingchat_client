const path = require('path');

module.exports = {
	entry: './src/roomClient.js',
	// entry: './src/RoomClient.class.js',
	// entry: './lib/all.js',
	mode: process.env.NODE_ENV || 'development',
	output: {
		filename: 'kingwebrtc.js',
		path: path.resolve(__dirname, 'dist'),
		//path:('/home/viper/signalserver/public/record'),
		libraryTarget: 'var',
		library: 'kingchat'
	},
	//devtool: 'cheap-source-map',
	devServer: {
		disableHostCheck: true
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: function (modulePath) {
					return false;
					return (
						/node_modules/.test(modulePath)
						&& !/protoo-client/.test(modulePath)
						&& !/debug/.test(modulePath)
						&& !/mediasoup-client/.test(modulePath)
					);
				},
				loader: 'babel-loader'
			}
		]
	}
};
