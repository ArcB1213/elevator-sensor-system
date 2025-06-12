// webpack.config.js (ESM Syntax)
// Install dependencies:
// npm install --save-dev webpack webpack-cli webpack-dev-server vue-loader @vue/compiler-sfc ts-loader typescript css-loader style-loader html-webpack-plugin

import path from "path";
import { fileURLToPath } from "url";
import { VueLoaderPlugin } from "vue-loader";
import HtmlWebpackPlugin from "html-webpack-plugin";

// ESM __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    entry: path.resolve(__dirname, "src", "main.ts"),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "bundle.[contenthash].js" : "bundle.js",
      publicPath: "/",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".js", ".vue", ".json"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    module: {
      rules: [
        { test: /\.(vue)$/, loader: "vue-loader" },
        {
          test: /\.(ts)$/,
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true,
          },
          exclude: /node_modules/,
        },
        { test: /\.css$/i, use: ["style-loader", "css-loader"] },
        { test: /\.(png|jpe?g|gif|svg)$/i, type: "asset/resource" },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src", "index.html"),
        favicon: path.resolve(__dirname, "public", "favicon.ico"),
      }),
    ],
    devtool: isProduction ? "source-map" : "eval-source-map",
    devServer: {
      static: { directory: path.join(__dirname, "public") },
      historyApiFallback: true,
      hot: true,
      open: true,
      port: 8080,
    },
  };
};
