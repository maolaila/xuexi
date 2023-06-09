## react源码解析8.render阶段

#### render阶段的入口

render阶段的主要工作是构建Fiber树和生成effectList，在第5章中我们知道了react入口的两种模式会进入performSyncWorkOnRoot或者performConcurrentWorkOnRoot，而这两个方法分别会调用workLoopSync或者workLoopConcurrent

```js
//ReactFiberWorkLoop.old.js
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

这两函数的区别是判断条件是否存在shouldYield的执行，如果浏览器没有足够的时间，那么会终止while循环，也不会执行后面的performUnitOfWork函数，自然也不会执行后面的render阶段和commit阶段，这部分属于scheduler的知识点，我们在第15章讲解。

- workInProgress：新创建的workInProgress fiber

- performUnitOfWork：workInProgress fiber和会和已经创建的Fiber连接起来形成Fiber树。这个过程类似深度优先遍历，我们暂且称它们为‘捕获阶段’和‘冒泡阶段’。伪代码执行的过程大概如下

  ```js
  function performUnitOfWork(fiber) {
    if (fiber.child) {
      performUnitOfWork(fiber.child);//beginWork
    }
    
    if (fiber.sibling) {
      performUnitOfWork(fiber.sibling);//completeWork
    }
  }
  ```

#### render阶段整体执行流程

用demo_0看视频调试

![react源码8.1](assets/20210529105753.png)

- 捕获阶段 从根节点rootFiber开始，遍历到叶子节点，每次遍历到的节点都会执行beginWork，并且传入当前Fiber节点，然后创建或复用它的子Fiber节点，并赋值给workInProgress.child。

- 冒泡阶段 在捕获阶段遍历到子节点之后，会执行completeWork方法，执行完成之后会判断此节点的兄弟节点存不存在，如果存在就会为兄弟节点执行completeWork，当全部兄弟节点执行完之后，会向上‘冒泡’到父节点执行completeWork，直到rootFiber。

- 示例，demo_0调试

  ```js
  function App() {
    return (
  		<>
        <h1>
          <p>count</p> xiaochen
        </h1>
      </>
    )
  }
    
  ReactDOM.render(<App />, document.getElementById("root"));
  ```

  当执行完深度优先遍历之后形成的Fiber树：

  ![react源码7.2](assets/20210529105757.png)

图中的数字是遍历过程中的顺序，可以看到，遍历的过程中会从应用的根节点rootFiber开始，依次执行beginWork和completeWork，最后形成一颗Fiber树，每个节点以child和return相连。

> 注意：当遍历到只有一个子文本节点的Fiber时，该Fiber节点的子节点不会执行beginWork和completeWork，如图中的‘chen’文本节点。这是react的一种优化手段

#### beginWork

beginWork主要的工作是创建或复用子fiber节点

```js
function beginWork(
  current: Fiber | null,//当前存在于dom树中对应的Fiber树
  workInProgress: Fiber,//正在构建的Fiber树
  renderLanes: Lanes,//第12章在讲
): Fiber | null {
 // 1.update时满足条件即可复用current fiber进入bailoutOnAlreadyFinishedWork函数
  if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if (
      oldProps !== newProps ||
      hasLegacyContextChanged() ||
      (__DEV__ ? workInProgress.type !== current.type : false)
    ) {
      didReceiveUpdate = true;
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      didReceiveUpdate = false;
      switch (workInProgress.tag) {
        // ...
      }
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderLanes,
      );
    } else {
      didReceiveUpdate = false;
    }
  } else {
    didReceiveUpdate = false;
  }

  //2.根据tag来创建不同的fiber 最后进入reconcileChildren函数
  switch (workInProgress.tag) {
    case IndeterminateComponent: 
      // ...
    case LazyComponent: 
      // ...
    case FunctionComponent: 
      // ...
    case ClassComponent: 
      // ...
    case HostRoot:
      // ...
    case HostComponent:
      // ...
    case HostText:
      // ...
  }
}
```

从代码中可以看到参数中有current Fiber，也就是当前真实dom对应的Fiber树，在之前介绍Fiber双缓存机制中，我们知道在首次渲染时除了rootFiber外，current 等于 null，因为首次渲染dom还没构建出来，在update时current不等于 null，因为update时dom树已经存在了，所以beginWork函数中用current === null来判断是mount还是update进入不同的逻辑

- mount：根据fiber.tag进入不同fiber的创建函数，最后都会调用到reconcileChildren创建子Fiber
- update：在构建workInProgress的时候，当满足条件时，会复用current Fiber来进行优化，也就是进入bailoutOnAlreadyFinishedWork的逻辑，能复用didReceiveUpdate变量是false，复用的条件是
  1. oldProps === newProps && workInProgress.type === current.type 属性和fiber的type不变
  2. !includesSomeLane(renderLanes, updateLanes) 更新的优先级是否足够，第15章讲解

#### reconcileChildren/mountChildFibers

创建子fiber的过程会进入reconcileChildren，该函数的作用是为workInProgress fiber节点生成它的child fiber即 workInProgress.child。然后继续深度优先遍历它的子节点执行相同的操作。

```js
//ReactFiberBeginWork.old.js
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) {
  if (current === null) {
    //mount时
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    //update
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes,
    );
  }
}
```

reconcileChildren会区分mount和update两种情况，进入reconcileChildFibers或mountChildFibers，reconcileChildFibers和mountChildFibers最终其实就是ChildReconciler传递不同的参数返回的函数，这个参数用来表示是否追踪副作用，在ChildReconciler中用shouldTrackSideEffects来判断是否为对应的节点打上effectTag，例如如果一个节点需要进行插入操作，需要满足两个条件：

1. fiber.stateNode!==null 即fiber存在真实dom，真实dom保存在stateNode上

2. (fiber.effectTag & Placement) !== 0 fiber存在Placement的effectTag

   ```js
   var reconcileChildFibers = ChildReconciler(true);
   var mountChildFibers = ChildReconciler(false);
   ```

   ```js
   function ChildReconciler(shouldTrackSideEffects) {
   	function placeChild(newFiber, lastPlacedIndex, newIndex) {
       newFiber.index = newIndex;
        
       if (!shouldTrackSideEffects) {//是否追踪副作用
         // Noop.
         return lastPlacedIndex;
       }
        
       var current = newFiber.alternate;
        
       if (current !== null) {
         var oldIndex = current.index;
        
         if (oldIndex < lastPlacedIndex) {
           // This is a move.
           newFiber.flags = Placement;
           return lastPlacedIndex;
         } else {
           // This item can stay in place.
           return oldIndex;
         }
       } else {
         // This is an insertion.
         newFiber.flags = Placement;
         return lastPlacedIndex;
       }
     }
   }
   ```

在之前心智模型的介绍中，我们知道为Fiber打上effectTag之后在commit阶段会被执行对应dom的增删改，而且在reconcileChildren的时候，rootFiber是存在alternate的，即rootFiber存在对应的current Fiber，所以rootFiber会走reconcileChildFibers的逻辑，所以shouldTrackSideEffects等于true会追踪副作用，最后为rootFiber打上Placement的effectTag，然后将dom一次性插入，提高性能。

```js
export const NoFlags = /*                      */ 0b0000000000000000000;
// 插入dom
export const Placement = /*                */ 0b00000000000010;
```

在源码的ReactFiberFlags.js文件中，用二进制位运算来判断是否存在Placement,例如让var a = NoFlags,如果需要在a上增加Placement的effectTag，就只要 effectTag | Placement就可以了

![react源码8.4](assets/20210529110149.png)

#### bailoutOnAlreadyFinishedWork

```js
//ReactFiberBeginWork.old.js
function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
  
  //...
	if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
    
    return null;
    
  } else {
    
    cloneChildFibers(current, workInProgress);
    
    return workInProgress.child;
    
  }
}
```

如果进入了bailoutOnAlreadyFinishedWork复用的逻辑，会判断优先级第12章介绍，优先级足够则进入cloneChildFibers否则返回null

#### completeWork

completeWork主要工作是处理fiber的props、创建dom、创建effectList

```js
//ReactFiberCompleteWork.old.js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;
    
//根据workInProgress.tag进入不同逻辑，这里我们关注HostComponent，HostComponent，其他类型之后在讲
  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case HostRoot:
   	//...
      
    case HostComponent: {
      popHostContext(workInProgress);
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;

      if (current !== null && workInProgress.stateNode != null) {
        // update时
       updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance,
        );
      } else {
        // mount时
        const currentHostContext = getHostContext();
        // 创建fiber对应的dom节点
        const instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
        // 将后代dom节点插入刚创建的dom里
        appendAllChildren(instance, workInProgress, false, false);
        // dom节点赋值给fiber.stateNode
        workInProgress.stateNode = instance;

        // 处理props和updateHostComponent类似
        if (
          finalizeInitialChildren(
            instance,
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
          )
        ) {
          markUpdate(workInProgress);
        }
     }
      return null;
    }
```

从简化版的completeWork中可以看到，这个函数做了一下几件事

- 根据workInProgress.tag进入不同函数，我们以HostComponent举例
- update时（除了判断current===null外还需要判断workInProgress.stateNode===null），调用updateHostComponent处理props（包括onClick、style、children ...），并将处理好的props赋值给updatePayload,最后会保存在workInProgress.updateQueue上
- mount时 调用createInstance创建dom，将后代dom节点插入刚创建的dom中，调用finalizeInitialChildren处理props（和updateHostComponent处理的逻辑类似）

之前我们有说到在beginWork的mount时，rootFiber存在对应的current，所以他会执行mountChildFibers打上Placement的effectTag，在冒泡阶段也就是执行completeWork时，我们将子孙节点通过appendAllChildren挂载到新创建的dom节点上，最后就可以一次性将内存中的节点用dom原生方法反应到真实dom中。

 在beginWork 中我们知道有的节点被打上了effectTag的标记，有的没有，而在commit阶段时要遍历所有包含effectTag的Fiber来执行对应的增删改，那我们还需要从Fiber树中找到这些带effectTag的节点嘛，答案是不需要的，这里是以空间换时间，在执行completeWork的时候遇到了带effectTag的节点，会将这个节点加入一个叫effectList中,所以在commit阶段只要遍历effectList就可以了（rootFiber.firstEffect.nextEffect就可以访问带effectTag的Fiber了）

 effectList的指针操作发生在completeUnitOfWork函数中，例如我们的应用是这样的

```js
function App() {
  
  const [count, setCount] = useState(0);
  
  return (
    
   	 <>
      <h1
        onClick={() => {
          setCount(() => count + 1);
        }}
      >
        <p title={count}>{count}</p> xiaochen
      </h1>
    </>
  )
  
}
```

那么我们的操作effectList指针如下（这张图是操作指针过程中的图，此时遍历到了app Fiber节点，当遍历到rootFiber时，h1，p节点会和rootFiber形成环状链表）

![react源码8.2](assets/20210529105807.png)

```js
rootFiber.firstEffect===h1

rootFiber.firstEffect.next===p
```

形成环状链表的时候会从触发更新的节点向上合并effectList直到rootFiber，这一过程发生在completeUnitOfWork函数中，整个函数的作用就是向上合并effectList

```js
//ReactFiberWorkLoop.old.js
function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  do {
    	//...

      if (
        returnFiber !== null &&
        (returnFiber.flags & Incomplete) === NoFlags
      ) {
        if (returnFiber.firstEffect === null) {
          returnFiber.firstEffect = completedWork.firstEffect;//父节点的effectList头指针指向completedWork的effectList头指针
        }
        if (completedWork.lastEffect !== null) {
          if (returnFiber.lastEffect !== null) {
            //父节点的effectList头尾指针指向completedWork的effectList头指针
            returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
          }
          //父节点头的effectList尾指针指向completedWork的effectList尾指针
          returnFiber.lastEffect = completedWork.lastEffect;
        }

        const flags = completedWork.flags;
        if (flags > PerformedWork) {
          if (returnFiber.lastEffect !== null) {
            //completedWork本身追加到returnFiber的effectList结尾
            returnFiber.lastEffect.nextEffect = completedWork;
          } else {
            //returnFiber的effectList头节点指向completedWork
            returnFiber.firstEffect = completedWork;
          }
          //returnFiber的effectList尾节点指向completedWork
          returnFiber.lastEffect = completedWork;
        }
      }
    } else {

      //...

      if (returnFiber !== null) {
        returnFiber.firstEffect = returnFiber.lastEffect = null;//重制effectList
        returnFiber.flags |= Incomplete;
      }
    }

  } while (completedWork !== null);

	//...
}
```

最后生成的fiber树如下

![react源码8.3](assets/20210529105811.png)

然后commitRoot(root);进入commit阶段