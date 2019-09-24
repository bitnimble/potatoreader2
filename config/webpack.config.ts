import * as path from 'path';
import * as webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

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
      ]
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'Potato Reader 2',
        meta: {
          'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no',
        },
      })
    ],
    resolve: {
      extensions: ['.tsx', '.ts'],
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, '../dist')
    }
  }
]

export default config;
