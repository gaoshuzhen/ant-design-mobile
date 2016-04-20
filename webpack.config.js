const webpack = require('atool-build/lib/webpack');

module.exports = function(webpackConfig) {
  if (process.env.ANTD === 'WEBSITE') {
    webpackConfig.entry = {
      'kitchen-sink':'./kitchen-sink/entry/index.jsx',
      index: './site/entry/index.jsx'
    };
    webpackConfig.resolve.root = process.cwd();
    webpackConfig.resolve.alias = {
      antm: process.cwd(),
      Clip: 'scripts/clip.js',
      DISTRICT: 'scripts/district.js',
      BrowserDemo: 'site/component/BrowserDemo',
    };

    const component = process.env.COMPONENT_STYLE;

    if (component !== undefined) {
      const babelConfig = require('atool-build/lib/getBabelCommonConfig')();
      babelConfig.plugins.push([
        '@alipay/babel-plugin-antm',
        {
          style: true,
          libDir: 'components',
        }
      ]);

      webpackConfig.module.loaders.push({
        test: new RegExp(`components/${component}/demo/.*\.md`),
        loader: `babel?${JSON.stringify(babelConfig)}!antd-md`,
      });
    }

    const exclude = [/node_modules/];
    if (component) {
      exclude.push(new RegExp(`components/${component}/demo/.*\.md`));
    }
    webpackConfig.module.loaders.push({
      test: /\.md$/,
      exclude: exclude,
      loader: `babel!antd-md`,
    });
  } else if (process.env.ANTD === 'PRODUCTION') {
    const entry = ['./index.js'];
    webpackConfig.entry = {
      'antm.min': entry,
    };
    webpackConfig.externals = {
      'react': {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom'
      }
    };
    webpackConfig.output.library = 'antm';
    webpackConfig.output.libraryTarget = 'umd';

    const uncompressedWebpackConfig = Object.assign({}, webpackConfig);
    uncompressedWebpackConfig.entry = {
      antm: entry,
    };
    uncompressedWebpackConfig.plugins = webpackConfig.plugins.filter((plugin) => {
      return !(plugin instanceof webpack.optimize.UglifyJsPlugin);
    });

    return [
      webpackConfig,
      uncompressedWebpackConfig,
    ];
  }

  return webpackConfig;
};
