const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const babelOptions = {
    "presets": "es2015"
};

const DIST_PATH = path.resolve(__dirname, 'dist');
const SOURCE_PATH = path.resolve(__dirname, 'src');
var PKG = require('./package.json');
module.exports = {
    entry: SOURCE_PATH + '/assets/ts/main.ts',
    output: {
        path: DIST_PATH,
        filename: '[name].js'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    module: {
        rules: [{
                test: require.resolve('jquery'),
                use: [{
                    loader: 'expose-loader',
                    options: 'jQuery'
                }, {
                    loader: 'expose-loader',
                    options: '$'
                }, {
                    loader: 'expose-loader',
                    options: 'window.jQuery'
                }]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader','less-loader']
                })
            },
            {
                test: /\.ts(x?)$/,
                exclude: /(node_modules|bower_components)/,
                use: [{
                        loader: 'babel-loader',
                        options: babelOptions
                    },
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.less$/, // import css from 'foo.less';
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'less-loader']
                })
            }
        ]
    },
    externals: {},
    //devtool: 'source-map',
    devServer: {
        compress: true,
        contentBase: './dist',
        hot: true
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new UglifyJSPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
        }),
        new ManifestPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            title: 'App Management',
            devServer: 'http://localhost:8081/',
            inject: 'body' // inject scripts before closing body tag
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('main.css'),
        new webpack.BannerPlugin({
            banner: `@author  : ${PKG.author.name} <${PKG.author.email}>\n@website : ${PKG.author.url}\n@hash    : [hash]\n@file    : [file]\n@package : ${PKG.name},\n@version : ${PKG.version}`})
    ]
};