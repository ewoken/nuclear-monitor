const { override, fixBabelImports } = require('customize-cra');

module.exports = override(
  fixBabelImports('antd', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css',
  }),
  fixBabelImports('antd-mobile', {
    libraryName: 'antd-mobile',
    style: 'css',
  }),
);
