const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./project/src/index.ts",
  output: {
    path: path.resolve(__dirname, "../../dist"),
    filename: "bundle.js",
    clean: true
  },
  resolve: {
    modules: [
      'src',
      'node_modules'
    ],
		extensions: [".", ".js", ".jsx", ".ts", ".tsx"],
	},
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      
    ],
    rules: [
      // `js` and `jsx` files are parsed using `babel`
      {
        test: /\.(js|jsx)$/, 
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
		// `ts` and `tsx` files are parsed using `ts-loader`
      { 
        test: /\.(ts|tsx)$/, 
        loader: "ts-loader" 
      }
    ],
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,

  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./project/public/index.html",
      inject: "body",
      publicPath: "./",
      minify: false,
    })
  ]
}
