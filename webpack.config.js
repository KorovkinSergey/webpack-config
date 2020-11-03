const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')


const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev


const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }
  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }
  return config
}
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev,
        reloadAll: true
      },
    },
    'css-loader'
  ]
  if (extra) {
    loaders.push(extra)
  }
  return loaders
}

const plugins = () => {
  const base = [
    new HTMLWebpackPlugin({
      template: 'index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: path.resolve(__dirname, 'dist/assets')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: filename('css'),
    })
  ]
  if (isProd) {
    base.push(new BundleAnalyzerPlugin())
  }
  return base
}

module.exports = {
  devtool: isDev ? 'source-map' : '',

  context: path.resolve(__dirname, 'src'),

  mode: 'development',

  entry: {
    main: ['@babel/polyfill', './index.js'],
  },

  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },

  resolve: {
    extensions: ['.js', '.json', '.png'],
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '~c': path.resolve(__dirname, 'src/components'),
      '~p': path.resolve(__dirname, 'src/pages'),
      '~s': path.resolve(__dirname, 'src/store')
    }
  },
  optimization: optimization(),

  devServer: {
    port: 3200,
    hot: isDev
  },

  plugins: plugins(),

  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders()
      },

      {
        test: /\.s[ac]ss$/,
        use: cssLoaders('sass-loader')
      },

      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader']
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              "@babel/plugin-transform-react-jsx",
              ["@babel/plugin-proposal-decorators", { "legacy": true }],
              ["@babel/plugin-proposal-class-properties", { "loose": true }]
            ]
          }
        }
      }

    ]
  }
}
