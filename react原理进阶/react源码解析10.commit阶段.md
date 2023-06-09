## react源码解析10.commit阶段

在render阶段的末尾会调用commitRoot(root);进入commit阶段，这里的root指的就是fiberRoot，然后会遍历render阶段生成的effectList，effectList上的Fiber节点保存着对应的props变化。之后会遍历effectList进行对应的dom操作和生命周期、hooks回调或销毁函数，各个函数做的事情如下

#### ![react源码10.1](assets/20210529105833.png)

在commitRoot函数中其实是调度了commitRootImpl函数

```js
//ReactFiberWorkLoop.old.js
function commitRoot(root) {
  var renderPriorityLevel = getCurrentPriorityLevel();
  runWithPriority$1(ImmediatePriority$1, commitRootImpl.bind(null, root, renderPriorityLevel));
  return null;
}
```

在commitRootImpl的函数中主要分三个部分：

- commit阶段前置工作

  1. 调用flushPassiveEffects执行完所有effect的任务

  2. 初始化相关变量

  3. 赋值firstEffect给后面遍历effectList用

     ```js
     //ReactFiberWorkLoop.old.js
     do {
         // 调用flushPassiveEffects执行完所有effect的任务
         flushPassiveEffects();
       } while (rootWithPendingPassiveEffects !== null);
          
     	//...
          
       // 重置变量 finishedWork指rooFiber
       root.finishedWork = null;
     	//重置优先级
       root.finishedLanes = NoLanes;
          
       // Scheduler回调函数重置
       root.callbackNode = null;
       root.callbackId = NoLanes;
          
       // 重置全局变量
       if (root === workInProgressRoot) {
         workInProgressRoot = null;
         workInProgress = null;
         workInProgressRootRenderLanes = NoLanes;
       } else {
       }
          
      	//rootFiber可能会有新的副作用 将它也加入到effectLis
       let firstEffect;
       if (finishedWork.effectTag > PerformedWork) {
         if (finishedWork.lastEffect !== null) {
           finishedWork.lastEffect.nextEffect = finishedWork;
           firstEffect = finishedWork.firstEffect;
         } else {
           firstEffect = finishedWork;
         }
       } else {
         firstEffect = finishedWork.firstEffect;
       }
     ```

- mutation阶段

   遍历effectList分别执行三个方法commitBeforeMutationEffects、commitMutationEffects、commitLayoutEffects执行对应的dom操作和生命周期

   在介绍双缓存Fiber树的时候，我们在构建完workInProgress Fiber树之后会将fiberRoot的current指向workInProgress Fiber，让workInProgress Fiber成为current，这个步骤发生在commitMutationEffects函数执行之后，commitLayoutEffects之前，因为componentWillUnmount发生在commitMutationEffects函数中，这时还可以获取之前的Update，而componentDidMount`和`componentDidUpdate会在commitLayoutEffects中执行，这时已经可以获取更新后的真实dom了

  ```js
  function commitRootImpl(root, renderPriorityLevel) {
  	//...
  	do {
        //...
        commitBeforeMutationEffects();
      } while (nextEffect !== null);
      
  	do {
        //...
        commitMutationEffects(root, renderPriorityLevel);//commitMutationEffects
      } while (nextEffect !== null);
      
    root.current = finishedWork;//切换current Fiber树
      
    do {
        //...
        commitLayoutEffects(root, lanes);//commitLayoutEffects
      } while (nextEffect !== null);
  	//...
  }
  ```

- mutation 后

  1. 根据rootDoesHavePassiveEffects赋值相关变量

  2. 执行flushSyncCallbackQueue处理componentDidMount等生命周期或者useLayoutEffect等同步任务

     ```js
     const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
          
     // 根据rootDoesHavePassiveEffects赋值相关变量
     if (rootDoesHavePassiveEffects) {
       rootDoesHavePassiveEffects = false;
       rootWithPendingPassiveEffects = root;
       pendingPassiveEffectsLanes = lanes;
       pendingPassiveEffectsRenderPriority = renderPriorityLevel;
     } else {}
     //...
          
     // 确保被调度
     ensureRootIsScheduled(root, now());
          
     // ...
          
     // 执行flushSyncCallbackQueue处理componentDidMount等生命周期或者useLayoutEffect等同步任务
     flushSyncCallbackQueue();
          
     return null;
     ```

现在让我们来看看mutation阶段的三个函数分别做了什么事情

- **commitBeforeMutationEffects** 该函数主要做了如下两件事

  1. 执行getSnapshotBeforeUpdate 在源码中commitBeforeMutationEffectOnFiber对应的函数是commitBeforeMutationLifeCycles在该函数中会调用getSnapshotBeforeUpdate，现在我们知道了getSnapshotBeforeUpdate是在mutation阶段中的commitBeforeMutationEffect函数中执行的，而commit阶段是同步的，所以getSnapshotBeforeUpdate也同步执行

     ```js
     function commitBeforeMutationLifeCycles(
       current: Fiber | null,
       finishedWork: Fiber,
     ): void {
       switch (finishedWork.tag) {
     		//...
         case ClassComponent: {
           if const instance = finishedWork.stateNode;
               const snapshot = instance.getSnapshotBeforeUpdate(//getSnapshotBeforeUpdate
                 finishedWork.elementType === finishedWork.type
                   ? prevProps
                   : resolveDefaultProps(finishedWork.type, prevProps),
                 prevState,
               );
             }
     }
     ```

  2. 调度useEffect

      在flushPassiveEffects函数中调用flushPassiveEffectsImpl遍历pendingPassiveHookEffectsUnmount和pendingPassiveHookEffectsMount，执行对应的effect回调和销毁函数，而这两个数组是在commitLayoutEffects函数中赋值的（待会就会讲到），mutation后effectList赋值给rootWithPendingPassiveEffects，然后scheduleCallback调度执行flushPassiveEffects

     ```js
     function flushPassiveEffectsImpl() {
       if (rootWithPendingPassiveEffects === null) {//在mutation后变成了root
         return false;
       }
       const unmountEffects = pendingPassiveHookEffectsUnmount;
       pendingPassiveHookEffectsUnmount = [];//useEffect的回调函数
       for (let i = 0; i < unmountEffects.length; i += 2) {
         const effect = ((unmountEffects[i]: any): HookEffect);
         //...
         const destroy = effect.destroy;
         destroy();
       }
          
       const mountEffects = pendingPassiveHookEffectsMount;//useEffect的销毁函数
       pendingPassiveHookEffectsMount = [];
       for (let i = 0; i < mountEffects.length; i += 2) {
         const effect = ((unmountEffects[i]: any): HookEffect);
         //...
         const create = effect.create;
         effect.destroy = create();
       }
     }
          
     ```

      componentDidUpdate或componentDidMount会在commit阶段同步执行(这个后面会讲到)，而useEffect会在commit阶段异步调度，所以适用于数据请求等副作用的处理

     > 注意，和在render阶段的fiber node会打上Placement等标签一样，useEffect或useLayoutEffect也有对应的effect Tag，在源码中对应export const Passive = /* */ 0b0000000001000000000;

     ```js
     function commitBeforeMutationEffects() {
       while (nextEffect !== null) {
         const current = nextEffect.alternate;
         const effectTag = nextEffect.effectTag;
          
         // 在commitBeforeMutationEffectOnFiber函数中会执行getSnapshotBeforeUpdate
         if ((effectTag & Snapshot) !== NoEffect) {
           commitBeforeMutationEffectOnFiber(current, nextEffect);
         }
          
         // scheduleCallback调度useEffect
         if ((effectTag & Passive) !== NoEffect) {
           if (!rootDoesHavePassiveEffects) {
             rootDoesHavePassiveEffects = true;
             scheduleCallback(NormalSchedulerPriority, () => {
               flushPassiveEffects();
               return null;
             });
           }
         }
         nextEffect = nextEffect.nextEffect;//遍历effectList
       }
     }
          
     ```

- **commitMutationEffects** commitMutationEffects主要做了如下几件事

  1. 调用commitDetachRef解绑ref（第11章hook会讲解）

  2. 根据effectTag执行对应的dom操作

  3. useLayoutEffect销毁函数在UpdateTag时执行

     ```js
     function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {
       //遍历effectList
       while (nextEffect !== null) {
          
         const effectTag = nextEffect.effectTag;
         // 调用commitDetachRef解绑ref
         if (effectTag & Ref) {
           const current = nextEffect.alternate;
           if (current !== null) {
             commitDetachRef(current);
           }
         }
          
         // 根据effectTag执行对应的dom操作
         const primaryEffectTag =
           effectTag & (Placement | Update | Deletion | Hydrating);
         switch (primaryEffectTag) {
           // 插入dom
           case Placement: {
             commitPlacement(nextEffect);
             nextEffect.effectTag &= ~Placement;
             break;
           }
           // 插入更新dom
           case PlacementAndUpdate: {
             // 插入
             commitPlacement(nextEffect);
             nextEffect.effectTag &= ~Placement;
             // 更新
             const current = nextEffect.alternate;
             commitWork(current, nextEffect);
             break;
           }
          	//...
           // 更新dom
           case Update: {
             const current = nextEffect.alternate;
             commitWork(current, nextEffect);
             break;
           }
           // 删除dom
           case Deletion: {
             commitDeletion(root, nextEffect, renderPriorityLevel);
             break;
           }
         }
          
         nextEffect = nextEffect.nextEffect;
       }
     }
     ```

     现在让我们来看看操作dom的这几个函数

     **commitPlacement插入节点：**

      简化后的代码很清晰，找到该节点最近的parent节点和兄弟节点，然后根据isContainer来判断是插入到兄弟节点前还是append到parent节点后

     ```js
     unction commitPlacement(finishedWork: Fiber): void {
     	//...
       const parentFiber = getHostParentFiber(finishedWork);//找到最近的parent
          
       let parent;
       let isContainer;
       const parentStateNode = parentFiber.stateNode;
       switch (parentFiber.tag) {
         case HostComponent:
           parent = parentStateNode;
           isContainer = false;
           break;
         //...
          
       }
       const before = getHostSibling(finishedWork);//找兄弟节点
       if (isContainer) {
         insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
       } else {
         insertOrAppendPlacementNode(finishedWork, before, parent);
       }
     }
     ```

     **commitWork更新节点：**

      在简化后的源码中可以看到

      如果fiber的tag是SimpleMemoComponent会调用commitHookEffectListUnmount执行对应的hook的销毁函数，可以看到传入的参数是HookLayout | HookHasEffect，也就是说执行useLayoutEffect的销毁函数。

      如果是HostComponent，那么调用commitUpdate，commitUpdate最后会调用updateDOMProperties处理对应Update的dom操作

     ```js
     function commitWork(current: Fiber | null, finishedWork: Fiber): void {
       if (!supportsMutation) {
         switch (finishedWork.tag) {
            //...
           case SimpleMemoComponent: {
            	commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork);
           }
          //...
         }
       }
          
       switch (finishedWork.tag) {
         //...
         case HostComponent: {
           //...
           commitUpdate(
                 instance,
                 updatePayload,
                 type,
                 oldProps,
                 newProps,
                 finishedWork,
               );
           }
           return;
         }
     }
     ```

     ```js
     function updateDOMProperties(
       domElement: Element,
       updatePayload: Array<any>,
       wasCustomComponentTag: boolean,
       isCustomComponentTag: boolean,
     ): void {
       // TODO: Handle wasCustomComponentTag
       for (let i = 0; i < updatePayload.length; i += 2) {
         const propKey = updatePayload[i];
         const propValue = updatePayload[i + 1];
         if (propKey === STYLE) {
           setValueForStyles(domElement, propValue);
         } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
           setInnerHTML(domElement, propValue);
         } else if (propKey === CHILDREN) {
           setTextContent(domElement, propValue);
         } else {
           setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
         }
       }
     }
          
          
     ```

     **commitDeletion删除节点:** 如果是ClassComponent会执行componentWillUnmount，删除fiber，如果是FunctionComponent 会删除ref、并执行useEffect的销毁函数，具体可在源码中查看unmountHostComponents、commitNestedUnmounts、detachFiberMutation这几个函数

     ```js
     function commitDeletion(
       finishedRoot: FiberRoot,
       current: Fiber,
       renderPriorityLevel: ReactPriorityLevel,
     ): void {
       if (supportsMutation) {
         // Recursively delete all host nodes from the parent.
         // Detach refs and call componentWillUnmount() on the whole subtree.
         unmountHostComponents(finishedRoot, current, renderPriorityLevel);
       } else {
         // Detach refs and call componentWillUnmount() on the whole subtree.
         commitNestedUnmounts(finishedRoot, current, renderPriorityLevel);
       }
       const alternate = current.alternate;
       detachFiberMutation(current);
       if (alternate !== null) {
         detachFiberMutation(alternate);
       }
     }
          
     ```

- **commitLayoutEffects** 在commitMutationEffects之后所有的dom操作都已经完成，可以访问dom了，commitLayoutEffects主要做了

  1. 调用commitLayoutEffectOnFiber执行相关生命周期函数或者hook相关callback

  2. 执行commitAttachRef为ref赋值

     ```js
     function commitLayoutEffects(root: FiberRoot, committedLanes: Lanes) {
       while (nextEffect !== null) {
         const effectTag = nextEffect.effectTag;
          
         // 调用commitLayoutEffectOnFiber执行生命周期和hook
         if (effectTag & (Update | Callback)) {
           const current = nextEffect.alternate;
           commitLayoutEffectOnFiber(root, current, nextEffect, committedLanes);
         }
          
         // ref赋值
         if (effectTag & Ref) {
           commitAttachRef(nextEffect);
         }
          
         nextEffect = nextEffect.nextEffect;
       }
     }
     ```

     **commitLayoutEffectOnFiber:**

      在源码中commitLayoutEffectOnFiber函数的别名是commitLifeCycles，在简化后的代码中可以看到，commitLifeCycles会判断fiber的类型，SimpleMemoComponent会执行useLayoutEffect的回调，然后调度useEffect，ClassComponent会执行componentDidMount或者componentDidUpdate，this.setState第二个参数也会执行，HostRoot会执行ReactDOM.render函数的第三个参数，例如

     ```js
     ReactDOM.render(<App />, document.querySelector("#root"), function() {
       console.log("root mount");
     });
     ```

     现在可以知道useLayoutEffect是在commit阶段同步执行，useEffect会在commit阶段异步调度

     ```js
     function commitLifeCycles(
       finishedRoot: FiberRoot,
       current: Fiber | null,
       finishedWork: Fiber,
       committedLanes: Lanes,
     ): void {
       switch (finishedWork.tag) {
         case SimpleMemoComponent: {
           // 此函数会调用useLayoutEffect的回调
           commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
           // 向pendingPassiveHookEffectsUnmount和pendingPassiveHookEffectsMount中push effect						// 并且调度它们
           schedulePassiveEffects(finishedWork);
         }
         case ClassComponent: {
           //条件判断...
           instance.componentDidMount();
           //条件判断...
           instance.componentDidUpdate(//update 在layout期间同步执行
             prevProps,
             prevState,
             instance.__reactInternalSnapshotBeforeUpdate,
           );      
         }
          
               
         case HostRoot: {
           commitUpdateQueue(finishedWork, updateQueue, instance);//render第三个参数
         }
              
       }
     }
     ```

      在schedulePassiveEffects中会将useEffect的销毁和回调函数push到pendingPassiveHookEffectsUnmount和pendingPassiveHookEffectsMount中

     ```js
     function schedulePassiveEffects(finishedWork: Fiber) {
       const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
       const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
       if (lastEffect !== null) {
         const firstEffect = lastEffect.next;
         let effect = firstEffect;
         do {
           const {next, tag} = effect;
           if (
             (tag & HookPassive) !== NoHookEffect &&
             (tag & HookHasEffect) !== NoHookEffect
           ) {
             //push useEffect的销毁函数并且加入调度
             enqueuePendingPassiveHookEffectUnmount(finishedWork, effect);
             //push useEffect的回调函数并且加入调度
             enqueuePendingPassiveHookEffectMount(finishedWork, effect);
           }
           effect = next;
         } while (effect !== firstEffect);
       }
     }
     ```

     **commitAttachRef:**

      commitAttachRef中会判断ref的类型，执行ref或者给ref.current赋值

     ```js
     function commitAttachRef(finishedWork: Fiber) {
       const ref = finishedWork.ref;
       if (ref !== null) {
         const instance = finishedWork.stateNode;
          
         let instanceToUse;
         switch (finishedWork.tag) {
           case HostComponent:
             instanceToUse = getPublicInstance(instance);
             break;
           default:
             instanceToUse = instance;
         }
          
         if (typeof ref === "function") {
           // 执行ref回调
           ref(instanceToUse);
         } else {
           // 如果是值的类型则赋值给ref.current
           ref.current = instanceToUse;
         }
       }
     }
     ```