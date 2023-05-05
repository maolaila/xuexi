## react源码解析1.开篇介绍和面试题

#### 怎样学习react源码

作为前端最常用的js库之一，熟悉react源码成了高级或资深前端工程师必备的能力，如果你不想停留在api的使用层面或者想在前端技能的深度上有所突破，那熟悉react源码将是你进步的很好的方式。

react的纯粹体现在它的api上，一切都是围绕setState状态更新进行的，但是内部的逻辑却经历了很大的重构和变化，而且代码量也不小，如果只是从源码文件和函数来阅读，那会很难以理解react的渲染流程。优秀工程师几年时间打造的库，必定有借鉴之处，那么我们应该怎样学习react源码呢。

![react源码1.3](assets/react%E6%BA%90%E7%A0%811.3.png)

首先，我们可以从函数调用栈入手，理清react的各个模块的功能和它们调用的顺序，盖房子一样，先搭好架子，对源码有个整体的认识，然后再看每个模块的细节，第一遍的时候切忌纠结每个函数实现的细节，陷入各个函数的深度调用中。其次可以结合一些demo和自己画图理解，react源码中设计大量的链表操作，画图是一个很好的理解指针操作的方式。源码里也有一些英文注释，可以根据注释或者根据此react源码解析文章进行理解。

熟悉react源码并不是一朝一夕的事，想精进自己的技术，必须花时间才行。

![react源码1.2](assets/react%E6%BA%90%E7%A0%811.2.png)

![react源码3.2](assets/react%E6%BA%90%E7%A0%813.2.png)

#### 课程特色

本课程遵循react 源码的核心思想，目的是打造一门通俗易懂的react源码解析系列文章。课程从源码的各个模块开始，结合大量demo、示例图解和视频教程，带着大家一步一步调试react源码，课程也会完全遵循react手写hook和精简版的react方便大家的理解，随着react大版本的更新，此课程也会一直更新。

#### 课程结构

![react源码1.1](assets/react%E6%BA%90%E7%A0%811.1.png)

#### 课程收获

为什么要学习react源码呢，你是使用了api很久，停留在框架使用层面还是会主动去了解框架的逻辑和运行方式呢。跟着课程走，理解起来不费力，你将收获：

- 面试加分：大厂前端岗都要求熟悉框架底层原理，也是面试必问环节，熟悉react源码会为你的面试加分，也会为你的谈薪流程增加不少筹码
- 巩固基础知识：在源码的scheduler中使用了***小顶堆*** 这种数据结构，调度的实现则使用了***messageChannel***，在render阶段的reconciler中则使用了***fiber、update、链表*** 这些结构，lane模型使用了二进制掩码，我们也会介绍diff算法怎样降低对比复杂度。学习本课程也顺便巩固了数据结构和算法、事件循环。
- **日常开发提升效率**：熟悉react源码之后，你对react的运行流程有了新的认识，在日常的开发中，相信你对组件的性能优化、react使用技巧和解决bug会更加得心应手。

相信学完课程之后，你对react的理解一定会上升一个档次，甚至会超过大多数面试官了

#### 常见面试题（带上问题学习吧）

以下这些问题可能你已经有答案了，但是你能从源码角度回答出来吗。

1. jsx和Fiber有什么关系
2. react17之前jsx文件为什么要声明import React from 'react'，之后为什么不需要了
3. Fiber是什么，它为什么能提高性能

**hooks**

1. 为什么hooks不能写在条件判断中

**状态/生命周期**

1. setState是同步的还是异步的
2. componentWillMount、componentWillMount、componentWillUpdate为什么标记UNSAFE

**组件**

1. react元素$$typeof属性什么
2. react怎么区分Class组件和Function组件
3. 函数组件和类组件的相同点和不同点

**开放性问题**

1. 说说你对react的理解/请说一下react的渲染过程
2. 聊聊react生命周期
3. 简述diff算法
4. react有哪些优化手段
5. react为什么引入jsx
6. 说说virtual Dom的理解
7. 你对合成事件的理解
   1. 我们写的事件是绑定在`dom`上么，如果不是绑定在哪里？
   2. 为什么我们的事件手动绑定`this`(不是箭头函数的情况)
   3. 为什么不能用 `return false `来阻止事件的默认行为？
   4. `react`怎么通过`dom`元素，找到与之对应的 `fiber`对象的？

**解释结果和现象**

1. 点击Father组件的div，Child会打印Child吗

   ```js
   function Child() {
     console.log('Child');
     return <div>Child</div>;
   }
       
       
   function Father(props) {
     const [num, setNum] = React.useState(0);
     return (
       <div onClick={() => {setNum(num + 1)}}>
         {num}
         {props.children}
       </div>
     );
   }
       
       
   function App() {
     return (
       <Father>
         <Child/>
       </Father>
     );
   }
       
   const rootEl = document.querySelector("#root");
   ReactDOM.render(<App/>, rootEl);
   ```

2. 打印顺序是什么

   ```js
   function Child() {
     useEffect(() => {
       console.log('Child');
     }, [])
     return <h1>child</h1>;
   }
       
   function Father() {
     useEffect(() => {
       console.log('Father');
     }, [])
         
     return <Child/>;
   }
       
   function App() {
     useEffect(() => {
       console.log('App');
     }, [])
       
     return <Father/>;
   }
   ```

3. useLayoutEffect/componentDidMount和useEffect的区别是什么

   ```js
   class App extends React.Component {
     componentDidMount() {
       console.log('mount');
     }
   }
       
   useEffect(() => {
     console.log('useEffect');
   }, [])
   ```

4. 如何解释demo_4、demo_8、demo_9出现的现象