import * as path from 'path';
import * as webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import postcssUrl from 'postcss-url';
import autoprefixer from 'autoprefixer';

const config: webpack.Configuration[] = [
  {
    entry: './src/main/main.ts',
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
    entry: './src/renderer/index.tsx',
    target: 'electron-renderer',
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
                importLoaders: 1,
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
        template: 'config/index.html'
      })
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
