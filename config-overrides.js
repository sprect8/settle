const { override, fixBabelImports, addLessLoader, addWebpackPlugin } = require('customize-cra');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');


module.exports = override(
    fixBabelImports('antd', {
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        lessOptions: { // If you are using less-loader@5 please spread the lessOptions to options directly
            javascriptEnabled: true,
            modifyVars: { '@primary-color': '#1DA57A' },
        },
    }),
    addWebpackPlugin(new AntdDayjsWebpackPlugin())
); 