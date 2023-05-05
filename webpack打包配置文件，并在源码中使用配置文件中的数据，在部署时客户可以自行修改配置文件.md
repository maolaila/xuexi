#### webpack打包配置文件，并在源码中使用配置文件中的数据，在部署时客户可以自行修改配置文件

你可以通过使用 webpack 的 `copy-webpack-plugin` 插件，将 `config` 文件夹中的文件复制到打包后的输出目录中，然后使用 `webpack.DefinePlugin` 插件将这些配置文件中的数据注入到应用程序中。

具体来说，你可以按照以下步骤进行配置：

1. 在 webpack 配置文件中引入 `copy-webpack-plugin` 插件：

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');
```

2. 添加插件配置到 `plugins` 中，将 `config` 文件夹中的所有内容复制到输出目录中：

```javascript
plugins: [
  new CopyWebpackPlugin({
    patterns: [
      { from: 'config', to: 'config' }
    ]
  })
]
```

3. 在应用程序中，使用 `webpack.DefinePlugin` 插件将配置文件中的数据注入到代码中：

```javascript
const webpack = require('webpack');
const configData = require('./config/config.js');

module.exports = {
  // ...其他配置...
  plugins: [
    new webpack.DefinePlugin({
      CONFIG_DATA: JSON.stringify(configData)
    })
  ]
};
```

4. 在应用程序中使用 `CONFIG_DATA` 全局变量来获取配置文件中的数据：

```javascript
console.log(CONFIG_DATA.someProperty);
```

这样，当你需要修改配置文件中的数据时，只需要在输出目录中找到对应的文件并修改即可，而不需要重新构建应用程序。