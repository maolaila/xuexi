## react源码解析13.hooks源码

#### hook调用入口

 在hook源码中hook存在于Dispatcher中，Dispatcher就是一个对象，不同hook 调用的函数不一样，全局变量ReactCurrentDispatcher.current会根据是mount还是update赋值为HooksDispatcherOnMount或HooksDispatcherOnUpdate

```js
ReactCurrentDispatcher.current = 
  current === null || current.memoizedState === null//mount or update
  ? HooksDispatcherOnMount
	: HooksDispatcherOnUpdate;  
const HooksDispatcherOnMount: Dispatcher = {//mount时
  useCallback: mountCallback,
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: mountImperativeHandle,
  useLayoutEffect: mountLayoutEffect,
  useMemo: mountMemo,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState,
  //...
};

const HooksDispatcherOnUpdate: Dispatcher = {//update时
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState,
  //...
};
```

#### hook数据结构

 在FunctionComponent中，多个hook会形成hook链表，保存在Fiber的memoizedState的上，而需要更新的Update保存在hook.queue.pending中

```js
const hook: Hook = {
  memoizedState: null,//对于不同hook，有不同的值
  baseState: null,//初始state
  baseQueue: null,//初始queue队列
  queue: null,//需要更新的update
  next: null,//下一个hook
};
```

下面来看下memoizedState对应的值

- useState：例如`const [state, updateState] = useState(initialState)`，`memoizedState等于`state的值
- useReducer：例如`const [state, dispatch] = useReducer(reducer, {});`，`memoizedState等于`state的值
- useEffect：在mountEffect时会调用pushEffect创建effect链表，`memoizedState`就等于effect链表，effect链表也会挂载到fiber.updateQueue上，每个effect上存在useEffect的第一个参数回调和第二个参数依赖数组，例如，`useEffect(callback, [dep])`，effect就是{create:callback, dep:dep,...}
- useRef：例如`useRef(0)`，memoizedState`就等于`{current: 0}
- useMemo：例如`useMemo(callback, [dep])`，`memoizedState`等于`[callback(), dep]`
- useCallback：例如`useCallback(callback, [dep])`，`memoizedState`等于`[callback, dep]`。`useCallback`保存`callback`函数，`useMemo`保存`callback`的执行结果

#### useState&useReducer

之所以把useState和useReducer放在一起，是因为在源码中useState就是有默认reducer参数的useReducer。

- useState&useReducer声明

   resolveDispatcher函数会获取当前的Dispatcher

  ```js
  function useState(initialState) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
  }
  function useReducer(reducer, initialArg, init) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useReducer(reducer, initialArg, init);
  }
    
  ```

- mount阶段

   mount阶段useState调用mountState，useReducer调用mountReducer，唯一区别就是它们创建的queue中lastRenderedReducer不一样，mount有初始值basicStateReducer，所以说useState就是有默认reducer参数的useReducer。

  ```js
  function mountState<S>(//
    initialState: (() => S) | S,
  ): [S, Dispatch<BasicStateAction<S>>] {
    const hook = mountWorkInProgressHook();//创建当前hook
    if (typeof initialState === 'function') {
      initialState = initialState();
    }
    hook.memoizedState = hook.baseState = initialState;//hook.memoizedState赋值
    const queue = (hook.queue = {//赋值hook.queue
      pending: null,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,//和mountReducer的区别
      lastRenderedState: (initialState: any),
    });
    const dispatch: Dispatch<//创建dispatch函数
      BasicStateAction<S>,
    > = (queue.dispatch = (dispatchAction.bind(
      null,
      currentlyRenderingFiber,
      queue,
    ): any));
    return [hook.memoizedState, dispatch];//返回memoizedState和dispatch
  }
    
  function mountReducer<S, I, A>(
    reducer: (S, A) => S,
    initialArg: I,
    init?: I => S,
  ): [S, Dispatch<A>] {
    const hook = mountWorkInProgressHook();//创建当前hook
    let initialState;
    if (init !== undefined) {
      initialState = init(initialArg);
    } else {
      initialState = ((initialArg: any): S);
    }
    hook.memoizedState = hook.baseState = initialState;//hook.memoizedState赋值
    const queue = (hook.queue = {//创建queue
      pending: null,
      dispatch: null,
      lastRenderedReducer: reducer,
      lastRenderedState: (initialState: any),
    });
    const dispatch: Dispatch<A> = (queue.dispatch = (dispatchAction.bind(//创建dispatch函数
      null,
      currentlyRenderingFiber,
      queue,
    ): any));
    return [hook.memoizedState, dispatch];//返回memoizedState和dispatch
  }
    
  ```

  ```react
  function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
    return typeof action === 'function' ? action(state) : action;
  }
  ```

- update阶段

  update时会根据hook中的update计算新的state

  ```react
  function updateReducer<S, I, A>(
    reducer: (S, A) => S,
    initialArg: I,
    init?: I => S,
  ): [S, Dispatch<A>] {
    const hook = updateWorkInProgressHook();//获取hook
    const queue = hook.queue;
    queue.lastRenderedReducer = reducer;
    
    //...更新state和第12章的state计算逻辑基本一致
    
    const dispatch: Dispatch<A> = (queue.dispatch: any);
    return [hook.memoizedState, dispatch];
  }
    
  ```

- 执行阶段

  useState执行setState后会调用dispatchAction，dispatchAction做的事情就是讲Update加入queue.pending中，然后开始调度

  ```react
  function dispatchAction(fiber, queue, action) {
    
    var update = {//创建update
      eventTime: eventTime,
      lane: lane,
      suspenseConfig: suspenseConfig,
      action: action,
      eagerReducer: null,
      eagerState: null,
      next: null
    }; 
    
    //queue.pending中加入update
      
    var alternate = fiber.alternate;
    
    if (fiber === currentlyRenderingFiber$1 || alternate !== null && alternate === currentlyRenderingFiber$1) {
      //如果是render阶段执行的更新didScheduleRenderPhaseUpdate=true
  }
      didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
    } else {
      if (fiber.lanes === NoLanes && (alternate === null || alternate.lanes === NoLanes)) {
        //如果fiber不存在优先级并且当前alternate不存在或者没有优先级，那就不需要更新了
        //优化的步骤
      }
    
      scheduleUpdateOnFiber(fiber, lane, eventTime);
    }
  }
    
  ```

#### useEffect

- 声明

  获取并返回useEffect函数

  ```js
  export function useEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void {
    const dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
  }
  ```

- mount阶段

   调用mountEffect，mountEffect调用mountEffectImpl，hook.memoizedState赋值为effect链表

  ```jsx
  function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {
    const hook = mountWorkInProgressHook();//获取hook
    const nextDeps = deps === undefined ? null : deps;//依赖
    currentlyRenderingFiber.flags |= fiberFlags;//增加flag
    hook.memoizedState = pushEffect(//memoizedState=effects环状链表
      HookHasEffect | hookFlags,
      create,
      undefined,
      nextDeps,
    );
  }
  ```

- update阶段

   浅比较依赖，如果依赖性变了pushEffect第一个参数传HookHasEffect | hookFlags，HookHasEffect表示useEffect依赖项改变了，需要在commit阶段重新执行

  ```jsx
  function updateEffectImpl(fiberFlags, hookFlags, create, deps): void {
    const hook = updateWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    let destroy = undefined;
    
    if (currentHook !== null) {
      const prevEffect = currentHook.memoizedState;
      destroy = prevEffect.destroy;//
      if (nextDeps !== null) {
        const prevDeps = prevEffect.deps;
        if (areHookInputsEqual(nextDeps, prevDeps)) {//比较deps
          //即使依赖相等也要将effect加入链表，以保证顺序一致
          pushEffect(hookFlags, create, destroy, nextDeps);
          return;
        }
      }
    }
    
    currentlyRenderingFiber.flags |= fiberFlags;
    
    hook.memoizedState = pushEffect(
      //参数传HookHasEffect | hookFlags，包含hookFlags的useEffect会在commit阶段执行这个effect
      HookHasEffect | hookFlags,
      create,
      destroy,
      nextDeps,
    );
  }
  ```

- 执行阶段

   在第9章commit阶段的commitLayoutEffects函数中会调用schedulePassiveEffects，将useEffect的销毁和回调函数push到pendingPassiveHookEffectsUnmount和pendingPassiveHookEffectsMount中，然后在mutation之后调用flushPassiveEffects依次执行上次render的销毁函数回调和本次render 的回调函数

  ```jsx
  const unmountEffects = pendingPassiveHookEffectsUnmount;
  pendingPassiveHookEffectsUnmount = [];
  for (let i = 0; i < unmountEffects.length; i += 2) {
    const effect = ((unmountEffects[i]: any): HookEffect);
    const fiber = ((unmountEffects[i + 1]: any): Fiber);
    const destroy = effect.destroy;
    effect.destroy = undefined;
    
    if (typeof destroy === 'function') {
      try {
        destroy();//销毁函数执行
      } catch (error) {
        captureCommitPhaseError(fiber, error);
      }
    }
  }
    
  const mountEffects = pendingPassiveHookEffectsMount;
  pendingPassiveHookEffectsMount = [];
  for (let i = 0; i < mountEffects.length; i += 2) {
    const effect = ((mountEffects[i]: any): HookEffect);
    const fiber = ((mountEffects[i + 1]: any): Fiber);
      
    try {
      const create = effect.create;//本次render的创建函数
     effect.destroy = create();
    } catch (error) {
      captureCommitPhaseError(fiber, error);
    }
  }
    
  ```

#### useRef

 sring类型的ref已经不在推荐使用(源码中string会生成refs，发生在coerceRef函数中)，ForwardRef只是把ref通过传参传下去，createRef也是{current: any这种结构，所以我们只讨论function或者{current: any}的useRef

```js
//createRef返回{current: any}
export function createRef(): RefObject {
  const refObject = {
    current: null,
  };
  return refObject;
}
```

- 声明阶段

   和其他hook一样

  ```js
  export function useRef<T>(initialValue: T): {|current: T|} {
    const dispatcher = resolveDispatcher();
    return dispatcher.useRef(initialValue);
  }
  ```

- mount阶段

   mount时会调用mountRef，创建hook和ref对象。

  ```js
  function mountRef<T>(initialValue: T): {|current: T|} {
    const hook = mountWorkInProgressHook();//获取useRef
    const ref = {current: initialValue};//ref初始化
    hook.memoizedState = ref;
    return ref;
  }
  ```

   render阶段：将带有ref属性的Fiber标记上Ref Tag，这一步发生在beginWork和completeWork函数中的markRef

  ```js
  export const Ref = /*                          */ 0b0000000010000000;
  ```

  ```js
  //beginWork中
  function markRef(current: Fiber | null, workInProgress: Fiber) {
    const ref = workInProgress.ref;
    if (
      (current === null && ref !== null) ||
      (current !== null && current.ref !== ref)
    ) {
      workInProgress.effectTag |= Ref;
    }
  }
  //completeWork中
  function markRef(workInProgress: Fiber) {
    workInProgress.effectTag |= Ref;
  }
  ```

   commit阶段：

   会在commitMutationEffects函数中判断ref是否改变，如果改变了会先执行commitDetachRef先删除之前的ref，然后在commitLayoutEffect中会执行commitAttachRef赋值ref。

  ```js
  function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {
    while (nextEffect !== null) {
      const effectTag = nextEffect.effectTag;
      // ...
        
      if (effectTag & Ref) {
        const current = nextEffect.alternate;
        if (current !== null) {
          commitDetachRef(current);//移除ref
        }
      }
    }
  ```

  ```js
  function commitDetachRef(current: Fiber) {
    const currentRef = current.ref;
    if (currentRef !== null) {
      if (typeof currentRef === 'function') {
        currentRef(null);//类型是function，则调用
      } else {
        currentRef.current = null;//否则赋值{current: null}
      }
    }
  }
    
  ```

  ```js
  function commitAttachRef(finishedWork: Fiber) {
    const ref = finishedWork.ref;
    if (ref !== null) {
      const instance = finishedWork.stateNode;//获取ref的实例
      let instanceToUse;
      switch (finishedWork.tag) {
        case HostComponent:
          instanceToUse = getPublicInstance(instance);
          break;
        default:
          instanceToUse = instance;
      }
    
      if (typeof ref === 'function') {//ref赋值
        ref(instanceToUse);
      } else {
        ref.current = instanceToUse;
      }
    }
  }
    
  ```

- update阶段

   update时调用updateRef获取获取当前useRef，然后返回hook链表

  ```js
  function updateRef<T>(initialValue: T): {|current: T|} {
    const hook = updateWorkInProgressHook();//获取当前useRef
    return hook.memoizedState;//返回hook链表
  }
  ```

#### useMemo&useCallback

- 声明阶段

  和其他hook 一样

- mount阶段

  mount阶段useMemo和useCallback唯一区别是在memoizedState中存贮callback还是callback计算出来的函数

  ```js
  function mountMemo<T>(
    nextCreate: () => T,
    deps: Array<mixed> | void | null,
  ): T {
    const hook = mountWorkInProgressHook();//创建hook
    const nextDeps = deps === undefined ? null : deps;
    const nextValue = nextCreate();//计算value
    hook.memoizedState = [nextValue, nextDeps];//把value和依赖保存在memoizedState中
    return nextValue;
  }
    
  function mountCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
    const hook = mountWorkInProgressHook();//创建hook
    const nextDeps = deps === undefined ? null : deps;
    hook.memoizedState = [callback, nextDeps];//把callback和依赖保存在memoizedState中
    return callback;
  }
  ```

- update阶段

  update时也一样，唯一区别就是直接用回调函数还是执行回调后返回的value作为[?, nextDeps]赋值给memoizedState

  ```js
  function updateMemo<T>(
    nextCreate: () => T,
    deps: Array<mixed> | void | null,
  ): T {
    const hook = updateWorkInProgressHook();//获取hook
    const nextDeps = deps === undefined ? null : deps;
    const prevState = hook.memoizedState;
    
    if (prevState !== null) {
      if (nextDeps !== null) {
        const prevDeps: Array<mixed> | null = prevState[1];
        if (areHookInputsEqual(nextDeps, prevDeps)) {//浅比较依赖
          return prevState[0];//没变 返回之前的状态
        }
      }
    }
    const nextValue = nextCreate();//有变化重新调用callback
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
  }
    
  function updateCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
    const hook = updateWorkInProgressHook();//获取hook
    const nextDeps = deps === undefined ? null : deps;
    const prevState = hook.memoizedState;
    
    if (prevState !== null) {
      if (nextDeps !== null) {
        const prevDeps: Array<mixed> | null = prevState[1];
        if (areHookInputsEqual(nextDeps, prevDeps)) {//浅比较依赖
          return prevState[0];//没变 返回之前的状态
        }
      }
    }
    
    hook.memoizedState = [callback, nextDeps];//变了重新将[callback, nextDeps]赋值给memoizedState
    return callback;
  }
  ```

#### useLayoutEffect

useLayoutEffect和useEffect一样，只是调用的时机不同，它是在commit阶段的commitLayout函数中同步执行

#### forwardRef

forwardRef也非常简单，就是传递ref属性

```js
export function forwardRef<Props, ElementType: React$ElementType>(
  render: (props: Props, ref: React$Ref<ElementType>) => React$Node,
) {
  
  const elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render,
  };
  
  return elementType;
}
//ForwardRef第二个参数是ref对象
let children = Component(props, secondArg);
```