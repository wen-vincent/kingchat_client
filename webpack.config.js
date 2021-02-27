const path = require('path');
// const resolve = (dir) => {
// 	return path.join(__dirname,  dir)
// }
module.exports = {
	entry: './src/main.js',
	// entry: './src/RoomClient.class.js',
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
				// include: [
				// 	path.resolve('./src/'),
				// 	path.resolve('node_modules/protoo-client/'),
				// ],
				// exclude: /node_modules\/(?!protoo-client).+/,
				// test: /\.js|jsx$/,
				test: /\.js$/,
				loader: 'babel-loader',
				// include: [resolve('node_modules/protoo-client')]
				// options: {
				// 	rootMode: "upward", // 自动寻找配置文件 babel.config.js
				// }
			}
		]
	},
	// resolve: {
	//     modules: [
	//         path.resolve('./src/'),
	// 		'node_modules',
	//     ]
	// },
	// watchOptions: {
    //     aggregateTimeout: 300,
    //     ignored: [
    //         /node_modules([\\]+|\/)+(?!protoo-client)/,
    //         /\protoo-client([\\]+|\/)node_modules/
    //     ]
    // }
};
