const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

 	mode: 'development',

  	entry: {
		index: './old/index.js',
		//print: './src/print.js',
 	},
 	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
 	},

 	plugins: [
		new HtmlWebpackPlugin({
		  template: './index.html',
		  inject: true,
		  chunks: ['index'],
		  filename: 'index.html'
		}),
 	],

  	devtool: 'inline-source-map',
  	devServer: {
		contentBase: './dist',
		port: 8080
  	},

  	module: {
		rules: [
	  		{
			test: /\.css$/i,
			use: ['style-loader', 'css-loader'],
	  		},
	  	{
			test: /\.(png|svg|jpg|jpeg|gif)$/i,
			type: 'asset/resource',
	  	},
	  		{
			test: /\.(glsl|vs|fs|vert|frag)$/,
			exclude: /node_modules/,
			use: [
		  		'raw-loader',
		  		'glslify-loader'
				]
	  		}
		],
 	},
};