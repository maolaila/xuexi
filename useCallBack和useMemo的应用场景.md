##### useCallBack

useCallBack是为了在父组件状态变更导致更新时，让传入子组件函数的栈地址不便，从而避免子组件二次更新的作用；一般结合React.memo来使用；

将需要传入子组件的函数用useCallBack包裹，同时子组件使用React.memo，因为React.memo对传入的props中的数据的栈地址进行校验，来判断是否重新渲染组件，所以当父组件重新构建时，由于传入的函数被useCallBack包裹，所以返回的还是旧函数的栈地址，从而避免子组件重新渲染；

同时，useCallBack并不能阻止函数的二次创建，因为该hook的作用是在依赖不变的情况下，不管返回新的函数内存地址，而是返回旧的函数内存地址；所以并不是每个函数都要用useCallBack来包裹，因为使用useCallBack之后会带来额外的性能开销，比如需要对比依赖项等；



##### useMemo

在 React 中，useMemo 是一个自定义钩子函数，它可以用于优化组件的性能。它的作用是**缓存计算结果并在依赖项（dependencies）没有发生变化时重复使用**它们。

useMemo 的原理是，当传入的依赖项发生变化时，useMemo 会重新计算其缓存的值。如果依赖项没有变化，则直接返回上一次缓存的值，而不重新计算。这可以减少不必要的计算和渲染，从而提高组件的性能。

useMemo 接收两个参数：一个函数和一个依赖项数组。第一个参数是需要缓存的函数，第二个参数是一个数组，包含了所有用于计算缓存值的依赖项。当依赖项中有任何一个值发生变化时，useMemo 就会重新计算缓存的值。

下面是一个简单的例子，演示了如何使用 useMemo：

```jsx
import { useMemo } from 'react';

function ExampleComponent({ data }) {
  const expensiveValue = useMemo(() => {
    // 执行一些昂贵的计算
    return someExpensiveCalculation(data);
  }, [data]);

  // 在此处使用 expensiveValue 进行渲染
  return <div>{expensiveValue}</div>;
}
```

在这个例子中，expensiveValue 是一个昂贵的计算结果。我们使用 useMemo 来缓存 expensiveValue 的值，并在依赖项 data 发生变化时重新计算。这样，我们就可以避免在每次渲染时都重新计算 expensiveValue，从而提高性能。