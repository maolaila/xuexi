### 14webpack5中的优化细节

 与构建效率有关的主要功能点：

##### Persistent Caching--持久化缓存

可以针对cache选项配置对应参数，例如缓存文件类型，缓存目录路径等

```javascript
module.exports={
	cache: {
        type: 'filesystem',
        cacheLocation: path.resolve(__dirname, '.appcache'),
        buildDependencies: {
            config: [__filename],
        }
    }
}
```

- cache.type：值为'memory'或'filesystem'，分别代表基于内存的临时缓存，和基于文件的持久化缓存；
- cache.cacheDirectory：缓存目录，默认目录为'node_modules/.cache/webpack'；
- cache.name：缓存名称，是作为cacheDirectory中的子目录命名，默认值为Webpack的${config.name}-${config.mode}
- cache.cacheLocation：缓存真正存放的地址，默认使用的是`path.resolve(cache.cacheDirectory, cache.name)`，可重新赋值；

webpack5中会跟踪每个模块的依赖项，例如fileDependencies，contextDependencies，missingDependencies；

注意：对于node_modules中的第三方依赖包，webpack会根据依赖包的package.json中的name和version字段来判断该模块是否发生变更，而不是依赖包中的代码；

当模块代码没有变化，但构建处理过程本身发生变化时，需要让全局缓存失效，重新构建并生成新的缓存；

- cache.buildDependencies：用于指定可能对构建过程产生影响的依赖项；
- version：传入`cache:{version: process.env.NODE_ENV}`，已达到不同环境切换时不共用缓存的效果；
- name：除了作为默认缓存目录下的子目录名称外，也起到了区分缓存数据的作用。`cache:{name: process.env.NODE_ENV}`
  - 由于name默认情况下是作为缓存子目录存在的，因此可以利用name保留多套缓存，在name切换时，若同名已存在，则可以复用之前的缓存；
  - 当cacheLocation配置存在时，将忽略name的缓存目录功能；
- managedPath、hashAlgorithm、store、idleTimeout等；

webpack5中，会忽略各个插件的缓存设置，统一由自身引擎提供构建各个环节的缓存读写逻辑；

##### TreeShaking

webpack4中，只支持es6的模块代码进行分析，且各依赖包必须声明无副作用（sideEffect: false）,webpack5中得到了改善；

- webpack5中增加了深层嵌套模块的导出跟踪功能，能够找到嵌套在最内层且未被使用的模块，并将其shaking掉；
- innerGraph：默认开启，作用也是将那些被导入且在嵌套中实际上未被使用的模块shaking掉；
- CommonJs：增加了一些对CommonJs风格代码静态分析的功能；
  - 支持exports.xxx/this.exports.xxx/module.exports.xxx语法的导出分析
  - 支持Object.defineProperty(exports,"xxx")语法的导出分析
  - 支持require("xxx").xxx语法的导出分析

##### Logs

增加了许多构建过程中的输出日志，通过日志可很直观的看出来某些过程的耗时，从而不需要人工手动引入耗时计算插件

##### 其他功能

改变微前端构建运行流程的Module Federation和对产物代码进行优化的Runtime Modules，优化了处理模块的工作队列，在生命周期hooks中增加了stage选项等；