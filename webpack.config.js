const path = require('path');

module.exports = {
	// entry: './src/RoomClient.class.js',
	entry: './src/main.js',
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
	// module: {
	// 	rules: [
	// 		{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
	// 	]
	// }
};
