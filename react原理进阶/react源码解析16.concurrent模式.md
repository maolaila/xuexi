## react源码解析16.concurrent模式

#### concurrent mode

react17支持concurrent mode，这种模式的根本目的是为了让应用保持cpu和io的快速响应，它是一组新功能，包括Fiber、Scheduler、Lane，可以根据用户硬件性能和网络状况调整应用的响应速度，核心就是为了实现异步可中断的更新。concurrent mode也是未来react主要迭代的方向。

- cup：让耗时的reconcile的过程能让出js的执行权给更高优先级的任务，例如用户的输入，
- io：依靠Suspense

#### Fiber

Fiber我们之前介绍过，这里我们来看下在concurrent mode下Fiber的意义，react15之前的reconcile是同步执行的，当组件数量很多，reconcile时的计算量很大时，就会出现页面的卡顿，为了解决这个问题就需要一套异步可中断的更新来让耗时的计算让出js的执行权给高优先级的任务，在浏览器有空闲的时候再执行这些计算。所以我们需要一种数据结构来描述真实dom和更新的信息，在适当的时候可以在内存中中断reconcile的过程，这种数据结构就是Fiber。

#### Scheduler

Scheduler独立于react本身，相当于一个单独的package，Scheduler的意义在于，当cup的计算量很大时，我们根据设备的fps算出一帧的时间，在这个时间内执行cup的操作，当任务执行的时间快超过一帧的时间时，会暂停任务的执行，让浏览器有时间进行重排和重绘。在适当的时候继续任务。

在js中我们知道generator也可以暂停和继续任务，但是我们还需要用优先级来排列任务，这个是generator无法完成的。在Scheduler中使用MessageChannel实现了时间切片，然后用小顶堆排列任务优先级的高低，达到了异步可中断的更新。

Scheduler可以用过期时间来代表优先级的高低。

优先级越高，过期时间越短，离当前时间越近，也就是说过一会就要执行它了。

优先级越低，过期时间越长，离当前时间越长，也就是过很久了才能轮到它执行。

#### lane

Lane用二进制位表示任务的优先级，方便优先级的计算，不同优先级占用不同位置的‘赛道’，而且存在批的概念，优先级越低，‘赛道’越多。高优先级打断低优先级，新建的任务需要赋予什么优先级等问题都是Lane所要解决的问题。

#### batchedUpdates

简单来说，在一个上下文中同时触发多次更新，这些更新会合并成一次更新，例如

```jsx
onClick() {
  this.setState({ count: this.state.count + 1 });
  this.setState({ count: this.state.count + 1 });
}
```

 在之前的react版本中如果脱离当前的上下文就不会被合并，例如把多次更新放在setTimeout中，原因是处于同一个context的多次setState的executionContext都会包含BatchedContext，包含BatchedContext的setState会合并，当executionContext等于NoContext，就会同步执行SyncCallbackQueue中的任务，所以setTimeout中的多次setState不会合并，而且会同步执行。

```js
onClick() {
 setTimeout(() => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
  });
}
export function batchedUpdates<A, R>(fn: A => R, a: A): R {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      resetRenderTimer();
       //executionContext为NoContext就同步执行SyncCallbackQueue中的任务
      flushSyncCallbackQueue();
    }
  }
}
```

 在Concurrent mode下，上面的例子也会合并为一次更新，根本原因在如下一段简化的源码，如果多次setState，会比较这几次setState回调的优先级，如果优先级一致，则先return掉，不会进行后面的render阶段

```js
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
  const existingCallbackNode = root.callbackNode;//之前已经调用过的setState的回调
  //...
	if (existingCallbackNode !== null) {
    const existingCallbackPriority = root.callbackPriority;
    //新的setState的回调和之前setState的回调优先级相等 则进入batchedUpdate的逻辑
    if (existingCallbackPriority === newCallbackPriority) {
      return;
    }
    cancelCallback(existingCallbackNode);
  }
	//调度render阶段的起点
	newCallbackNode = scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root),
  );
	//...
}
```

 那为什么在Concurrent mode下，在setTimeout回调多次setState优先级一致呢，因为在获取Lane的函数requestUpdateLane，只有第一次setState满足currentEventWipLanes === NoLanes，所以他们的currentEventWipLanes参数相同，而在findUpdateLane中schedulerLanePriority参数也相同（调度的优先级相同），所以返回的lane相同。

```js
export function requestUpdateLane(fiber: Fiber): Lane {
	//...
  if (currentEventWipLanes === NoLanes) {//第一次setState满足currentEventWipLanes === NoLanes
    currentEventWipLanes = workInProgressRootIncludedLanes;
  }
  //...
  //在setTimeout中schedulerLanePriority, currentEventWipLanes都相同，所以返回的lane也相同
  lane = findUpdateLane(schedulerLanePriority, currentEventWipLanes);
  //...

  return lane;
}
```

#### Suspense

 Suspense可以在请求数据的时候显示pending状态，请求成功后展示数据，原因是因为Suspense中组件的优先级很低，而离屏的fallback组件优先级高，当Suspense中组件resolve之后就会重新调度一次render阶段，此过程发生在updateSuspenseComponent函数中，具体可以看调试suspense的视频

#### 总结

Fiber为concurrent架构提供了数据层面的支持。

Scheduler为concurrent实现时间片调度提供了保障。

Lane模型为concurrent提供了更新的策略

上层实现了batchedUpdates和Suspense