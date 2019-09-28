import autoprefixer from 'autoprefixer';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import postcssUrl from 'postcss-url';
import * as webpack from 'webpack';

const devMode = true;

const config: webpack.Configuration[] = [
  {
    mode: devMode ? 'development' : 'production',
    devtool: devMode ? 'cheap-module-eval-source-map' : undefined,
    entry: path.resolve(__dirname, '../src/main/main.ts'),
    target: 'electron-main',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            transpileOnly: true,
          },
        },
      ]
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
    ],
    resolve: {
      extensions: ['.tsx', '.ts'],
    },
    output: {
      filename: 'electron.js',
      path: path.resolve(__dirname, '../dist')
    }
  },
  {
    mode: devMode ? 'development' : 'production',
    devtool: devMode ? 'cheap-module-eval-source-map' : undefined,
    devServer: devMode ? {
      contentBase: path.resolve(__dirname, '../dist'),
      hot: false,
    } : undefined,
    entry: path.resolve(__dirname, '../src/renderer/index.tsx'),
    target: devMode ? 'web' : 'electron-renderer',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            transpileOnly: true,
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
              options: {
                injectType: 'singletonStyleTag',
              },
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                modules: {
                  localIdentName: '[path][name]__[local]--[hash:base64:5]',
                },
              },
            },
            'resolve-url-loader',
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                plugins: () => [
                  postcssUrl(),
                  autoprefixer(),
                ],
              },
            }
          ],
        }
      ]
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'Potato Reader 2',
        template: path.resolve(__dirname, './index.html'),
      }),
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, '../dist')
    }
  }
]

export default config;
