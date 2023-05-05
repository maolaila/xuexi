## react源码解析4.源码目录结构和调试

#### 源码目录结构

源码中主要包括如下部分

- fixtures：为代码贡献者提供的测试React
- packages：主要部分，包含Scheduler，reconciler等
- scripts：react构建相关

下面来看下packages主要包含的模块

- react：核心Api如：React.createElement、React.Component都在这

- 和平台相关render相关的文件夹：

  react-art：如canvas svg的渲染 react-dom：浏览器环境 react-native-renderer：原生相关 react-noop-renderer：调试或者fiber用

- 试验性的包

  react-server: ssr相关

  react-fetch: 请求相关

  react-interactions: 和事件如点击事件相关

  react-reconciler: 构建节点

- shared：包含公共方法和变量

- 辅助包：

  react-is : 判断类型

  react-client: 流相关

  react-fetch: 数据请求相关

react-refresh: 热加载相关

- scheduler：调度器相关
- React-reconciler：在render阶段用它来构建fiber节点

#### 怎样调试源码

本课程使用的react版本是17.0.1，通过下面几步就可以调试源码了，

方法一：可以用现成的包含本课程所有demo的项目来调试，建议使用已经构建好的项目，地址：https://github.com/xiaochen1024/react_source_demo

方法二：

1. clone源码：`git clone https://github.com/facebook/react.git`
2. 依赖安装：`npm install` or `yarn`
3. build源码：npm run build react/index,react/jsx,react-dom/index,scheduler --type=NODE

- 为源码建立软链：

  ```shell
  cd build/node_modules/react
  npm link
  cd build/node_modules/react-dom
  npm link
  ```

- create-react-app创建项目

  ```shell
  npx create-react-app demo
  npm link react react-dom
  ```