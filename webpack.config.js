const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/game.js', // Replace with your actual entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'DizzySpark', // Change this to the name you want for your global variable
    libraryTarget: 'umd',
  },
  target: 'web',
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};