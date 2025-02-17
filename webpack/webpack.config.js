const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
    mode: "production",
    entry: {
        background: path.resolve(__dirname, "..", "src", "core", "background", "main.ts"),
        options: path.resolve(__dirname, "..", "src", "core", "pages", "options-page", "main.tsx"),
        popup: path.resolve(__dirname, "..", "src", "core", "pages", "popup-page", "main.tsx"),
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: ".", context: "public" }],
        }),
    ],
};