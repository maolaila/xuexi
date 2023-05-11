### React原理及面试题

##### jsx和Fiber有什么关系

JSX 是 React 中用于编写组件的一种语法扩展，它允许在 JavaScript 代码中直接编写类似 HTML 的结构。当使用 JSX 编写组件时，React 会将 JSX 转换为对应的 JavaScript 对象表示形式，这些对象被称为 React 元素。

Fiber 是 React 16 中引入的新的协调机制，它是 React 内部的一种实现方式，用于管理组件的更新、调度和渲染过程。Fiber 架构的目标是提供更好的性能和用户体验，通过引入协调优先级、增量更新和可中断的任务调度，使 React 在处理大型复杂应用时能够更加高效地更新组件。

在源码层面，JSX 和 Fiber 是相互关联的：

1. JSX 被转换为 React 元素：当使用 JSX 编写组件时，Babel 或其他工具会将 JSX 代码转换为 React 元素的 JavaScript 表示形式。React 元素是一个普通的 JavaScript 对象，它描述了组件的类型、属性和子元素。

2. Fiber 使用 React 元素进行协调：在组件更新过程中，Fiber 使用 React 元素作为协调的基本单位。Fiber 数据结构中的每个节点都包含了与 React 元素相对应的信息，用于构建组件树、记录组件状态以及进行协调更新。

3. Fiber 实现增量更新和任务调度：Fiber 架构使用了一种称为 Fiber 树的数据结构，它以链表形式表示组件树的结构，并且可以被中断和恢复。Fiber 树中的每个节点都代表了一个组件或 DOM 节点，并包含了与渲染和更新相关的信息。Fiber 的任务调度算法可以根据不同的优先级动态地安排更新任务的执行顺序，从而提高用户界面的响应性。

综上所述，JSX 是 React 中用于编写组件的语法扩展，而 Fiber 是 React 16 中引入的一种协调机制，用于管理组件的更新和渲染过程。在源码层面，JSX 被转换为 React 元素，并由 Fiber 使用这些元素进行组件协调、增量更新和任务调度。



##### react17之前jsx文件为什么要声明import React from 'react'，之后为什么不需要了

在React 17中，React更新了JSX的转换方法，不再需要依赖React库中的一些函数和对象来转换JSX。因此，React 17之后，我们不再需要在JSX文件的顶部声明 `import React from 'react'` 语句。这并不意味着React库不再需要使用，而是在**编译过程中React库会被自动引入**，因此我们不需要手动引入它。



##### Fiber是什么，它为什么能提高性能

Fiber是React 16中的一种新的协调引擎，它是React内部的一种算法，用于实现增量渲染和调度。Fiber可以将渲染过程分成一系列小的任务，这些任务可以被中断、暂停、恢复和重新启动。这使得React能够更好地响应用户的交互和动画，提高了应用的性能和用户体验。

在React 15及之前版本中，React使用的是一种递归遍历的算法，称为“stack reconciler”，它会在渲染过程中一直持续运行，直到渲染完成为止。这种算法会导致当组件的层级结构很深时，递归遍历的时间会很长，导致页面卡顿甚至无法响应用户的操作。

而Fiber算法的引入解决了这个问题。Fiber算法通过将递归算法转化为迭代算法，并将整个渲染过程拆分成多个小的任务单元，将任务划分成多个优先级，并且能够中断和恢复执行任务，从而更好地控制任务执行的时间和优先级，提高了渲染的性能和响应能力。例如，当用户进行交互时，React可以中断正在执行的任务，先处理用户的交互事件，从而更快地响应用户的操作。

总之，Fiber算法的引入，使React能够更好地响应用户的交互和动画，提高了应用的性能和用户体验。



##### 为什么hooks不能写在条件判断中

因为Hooks必须按照规则在React函数组件的顶层中调用，不能在条件语句、循环语句、嵌套函数等内部调用。

这是因为Hooks是React的一种特殊函数，它们需要被React的调度器在每次渲染组件时正确地执行。React调度器会根据Hooks的调用顺序来管理它们的状态，如果Hooks被写在条件语句中，那么在某些条件下它可能会被跳过，导致Hooks的调用顺序出现错误，从而可能导致应用出现未知的错误。

为了避免这种情况的发生，React规定Hooks必须按照规则在React函数组件的顶层中调用，不能在条件语句、循环语句、嵌套函数等内部调用。如果需要在某些条件下使用Hooks，可以考虑将条件语句移到Hooks的内部，或者使用其他的技巧，例如在组件中使用状态变量来控制条件逻辑。



##### setState是同步的还是异步的

在React中，setState既可以是同步的，也可以是异步的，具体取决于它被调用的时机和上下文环境。

在React类组件中，如果在事件处理程序中调用setState，React会将该更新放入队列中，并在适当的时候异步地更新组件。这是因为React希望在一次更新周期中批量处理所有的更新，从而提高性能。因此，在React类组件中，通常认为setState是异步的。

但在某些情况下，setState可能会被同步执行。例如，在React生命周期方法（如componentDidMount）中调用setState时，React会在组件渲染之前同步地更新组件状态。另外，当在使用React的新版本时，可以通过传递一个回调函数给setState，来确保状态已经被更新，从而可以使用最新的状态值。

在React函数组件中，因为没有实例对象，所以setState不存在异步或同步的问题，因为函数组件没有批量更新机制。在函数组件中，setState实际上是同步的，即状态更新会立即生效。

总之，setState既可以是同步的，也可以是异步的，具体取决于它被调用的时机和上下文环境。在React类组件中，通常认为setState是异步的，但也可能被同步执行，而在React函数组件中，setState是同步的。

在React中，setState除了可以接收一个对象作为更新值外，还可以接收一个函数作为参数，这个函数可以在状态更新完成后被调用。传递给setState的函数会接收两个参数：前一个状态prevState和当前的属性props，并返回一个对象，这个对象会被合并到组件的状态中。

使用回调函数可以确保在状态更新后立即执行某些操作，并使用最新的状态值。例如，以下代码演示了如何使用回调函数来更新状态并在更新完成后执行某些操作：

```jsx
this.setState({count: this.state.count + 1}, () => {
  console.log('Count updated:', this.state.count);
});
```

在这个例子中，setState接收一个对象和一个回调函数。当状态更新完成后，回调函数会被调用，并输出最新的计数值。请注意，回调函数中的this.state.count是最新的状态值。

如果传递给setState的函数不需要访问先前的状态或属性值，则可以将其简化为箭头函数。例如：

```jsx
this.setState(prevState => ({count: prevState.count + 1}));
```

在这个例子中，回调函数被替换为一个函数，该函数接收prevState作为参数，并返回一个新的状态对象，其中count属性被更新。

总之，使用回调函数可以确保在状态更新后立即执行某些操作，并使用最新的状态值。传递函数给setState可以通过传递函数而不是对象来更新状态。



##### componentWillMount、componentWillMount、componentWillUpdate为什么标记UNSAFE

在React 17及以后的版本中，componentWillMount、componentWillReceiveProps和componentWillUpdate等生命周期方法被标记为“UNSAFE”，这是为了强调它们在未来的版本中可能会被移除。这些生命周期方法被标记为“UNSAFE”的原因是因为它们可能会导致一些意外的副作用，如引起额外的渲染、性能问题、数据不一致等。

具体来说，这些生命周期方法有以下问题：

1. componentWillReceiveProps方法会在父组件重新渲染时被触发，即使传入的属性没有变化也会被触发，这可能导致不必要的更新，从而影响性能。

2. componentWillMount和componentWillUpdate方法可能会在服务器端渲染时被触发，因为服务器端渲染不支持异步操作，因此可能会影响渲染的效率和正确性。

为了解决这些问题，React建议使用其他生命周期方法来替代它们。例如，可以使用getDerivedStateFromProps方法来代替componentWillReceiveProps方法，使用componentDidMount和componentDidUpdate方法来代替componentWillMount和componentWillUpdate方法。

需要注意的是，虽然这些生命周期方法被标记为“UNSAFE”，但它们并没有被完全删除，可以继续使用。但是，在使用这些生命周期方法时，需要注意它们可能会引起的问题，并避免不必要的副作用。此外，React可能会在未来的版本中移除这些生命周期方法，因此需要考虑到迁移的问题。



##### react元素$$typeof属性什么

在React中，每个React元素都是一个对象，这个对象包含了描述元素的各种属性和配置信息。其中，$$typeof属性是一个特殊的属性，用于标识React元素的类型。

具体来说，typeof属性是一个符号，用于标识React元素的类型。例如，React中的原生组件类型使用的是React.isValidElement方法判断*t**y**p**eo**f*属性是一个符号，用于标识*R**e**a**c**t*元素的类型。例如，*R**e**a**c**t*中的原生组件类型使用的是*R**e**a**c**t*.*i**s**Va**l**i**d**El**e**m**e**n**t*方法判断typeof属性是否等于Symbol.for('react.element')。React.isValidElement方法是一个React提供的工具方法，用于检查一个对象是否为React元素。如果该对象是React元素，则返回true，否则返回false。

除了Symbol.for('react.element')，React还定义了其他一些符号，用于标识不同类型的React元素。例如，React.isValidElementType方法用于检查一个对象是否为有效的React元素类型，它会检查$$typeof属性是否等于Symbol.for('react.forward_ref')、Symbol.for('react.memo')、Symbol.for('react.lazy')等值中的一个。

在React内部，typeof属性是一个用于优化渲染性能的重要机制。由于React元素的类型信息可以通过*t**y**p**eo**f*属性是一个用于优化渲染性能的重要机制。由于*R**e**a**c**t*元素的类型信息可以通过typeof属性快速判断，因此React可以根据不同的元素类型采用不同的渲染策略，从而提高渲染性能。同时，由于$$typeof属性是一个符号，因此它不会和其他属性产生命名冲突，避免了潜在的bug。



##### react怎么区分Class组件和Function组件

在React中，可以通过检查组件的类型来区分Class组件和Function组件。具体来说，有以下两种方法：

1. 使用typeof操作符

在JavaScript中，使用typeof操作符可以获取一个值的类型。对于Class组件，它的类型是function，而对于Function组件，它的类型也是function。因此，可以通过typeof操作符判断一个组件是Class组件还是Function组件。例如：

```jsx
class MyClassComponent extends React.Component {
  // ...
}

function MyFunctionComponent(props) {
  // ...
}

console.log(typeof MyClassComponent); // "function"
console.log(typeof MyFunctionComponent); // "function"
```

2. 使用React.Component.isPrototypeOf方法

React.Component是React中所有Class组件的基类，因此可以通过React.Component.isPrototypeOf方法检查一个组件是否是Class组件。对于Function组件，该方法返回false，而对于Class组件，该方法返回true。例如：

```jsx
class MyClassComponent extends React.Component {
  // ...
}

function MyFunctionComponent(props) {
  // ...
}

console.log(React.Component.isPrototypeOf(MyClassComponent)); // true
console.log(React.Component.isPrototypeOf(MyFunctionComponent)); // false
```

需要注意的是，使用这些方法只能检查一个组件的类型，但并不能判断一个组件是否是纯函数组件或有状态组件等。要想判断一个组件是否是纯函数组件或有状态组件，需要查看组件的实现方式。



##### 函数组件和类组件的相同点和不同点

函数组件和类组件是React中最常见的两种组件类型，它们有很多相同点和不同点。

相同点：

1. 用于渲染UI：函数组件和类组件都用于渲染UI，根据传入的props参数生成对应的UI元素。

2. 接收props参数：函数组件和类组件都可以接收props参数，并根据这些参数生成对应的UI元素。

3. 更新状态：函数组件和类组件都可以使用React的状态管理机制来更新UI状态，并在状态更新后重新渲染UI。

不同点：

1. 实现方式不同：函数组件是一个纯函数，它的输入是props参数，输出是UI元素。类组件则是一个类，它包含了一个或多个方法，用于实现组件的生命周期和业务逻辑。

2. 状态管理方式不同：在函数组件中，需要使用React的Hooks API（如useState）来管理组件的状态。而在类组件中，可以直接使用this.state和this.setState方法来管理组件的状态。

3. 生命周期不同：类组件拥有一系列的生命周期方法，如componentDidMount、componentWillUnmount等，可以在不同的阶段执行相应的操作。函数组件则只有useState、useEffect等Hooks API，用于实现类似于生命周期的功能。

4. 可读性不同：在逻辑相对简单的情况下，函数组件通常比类组件更加简洁和易读。但对于逻辑较为复杂的组件，使用类组件可以更好地组织和管理业务逻辑。

综上所述，函数组件和类组件都有各自的优缺点，应根据具体的场景和需求选择合适的组件类型。通常来说，简单的组件可以使用函数组件实现，复杂的组件则可以使用类组件实现。



##### 说说你对react的理解/请说一下react的渲染过程

React是一个用于构建用户界面的JavaScript库。它采用组件化的思想，将UI拆分成独立的、可复用的组件，并使用虚拟DOM技术来优化性能，使得UI更新更快、更高效。

React的渲染过程如下：

1. 组件初始化阶段：React通过调用组件的构造函数来初始化组件，并设置组件的默认属性和初始状态。这一阶段只会在组件的第一次渲染时执行。

2. 组件挂载阶段：React将组件渲染成虚拟DOM树，并将其插入到页面中。这一阶段包括以下步骤：

   1) 调用组件的render方法，生成虚拟DOM树。

   2) 通过diff算法比较新旧虚拟DOM树的差异，计算出需要更新的部分。

   3) 将需要更新的部分打包成一批DOM操作，批量执行，提高性能。

   4) 将虚拟DOM树转换成真实的DOM节点，并插入到页面中。

3. 组件更新阶段：当组件的状态或属性发生变化时，React会根据新的属性和状态重新渲染组件，并更新虚拟DOM树。这一阶段包括以下步骤：

   1) 根据新的属性和状态生成新的虚拟DOM树。

   2) 通过diff算法比较新旧虚拟DOM树的差异，计算出需要更新的部分。

   3) 将需要更新的部分打包成一批DOM操作，批量执行，提高性能。

   4) 将虚拟DOM树转换成真实的DOM节点，并更新页面中相应的节点。

4. 组件卸载阶段：当组件从页面中被移除时，React会调用组件的卸载方法，清理组件中的相关资源，防止内存泄漏。

总结：React的渲染过程是一个经过优化的、高效的过程，它通过虚拟DOM技术和批量更新操作，使得UI更新更快、更高效。



##### 聊聊react生命周期

React组件的生命周期指的是从组件创建到组件销毁整个过程中的各个阶段。在React 16.3之前，组件生命周期包括三个阶段：Mounting、Updating和Unmounting，每个阶段都有不同的生命周期函数。在React 16.3之后，由于React引入了新的Context API和Error Boundaries等特性，组件生命周期发生了一些变化，其中有些生命周期函数被弃用或改名，也有一些新的生命周期函数被引入。以下是React组件的生命周期函数：

1. Mounting阶段：组件被创建并插入到DOM中的过程。

   - constructor()：组件构造函数，一般用于初始化组件的state和绑定事件方法等操作。

   - static getDerivedStateFromProps()：组件静态方法，用于在组件挂载前根据props计算并更新state。

   - render()：渲染方法，用于返回组件的虚拟DOM树。

   - componentDidMount()：组件挂载后调用，一般用于进行异步操作、获取DOM节点或添加全局事件监听等操作。

2. Updating阶段：组件的props或state发生变化时，会重新渲染组件。

   - static getDerivedStateFromProps()：同上。

   - shouldComponentUpdate()：返回一个布尔值，用于判断是否需要重新渲染组件，可用于优化性能。

   - render()：同上。

   - getSnapshotBeforeUpdate()：组件更新前调用，一般用于在DOM更新前获取DOM状态。

   - componentDidUpdate()：组件更新后调用，一般用于进行异步操作、获取DOM节点或添加全局事件监听等操作。

3. Unmounting阶段：组件从DOM中被移除时调用。

   - componentWillUnmount()：组件卸载前调用，一般用于清除组件中的定时器、事件监听、异步请求等操作。

4. Error Handling阶段：组件在渲染过程中发生错误时调用。

   - static getDerivedStateFromError()：在渲染过程中发生错误时调用，用于根据错误信息更新state。

   - componentDidCatch()：在渲染过程中发生错误时调用，用于记录错误信息和清理组件状态等操作。

需要注意的是，在React 17之后，getDerivedStateFromProps()和componentWillReceiveProps()等生命周期函数被标记为unsafe，不建议使用，建议使用其他的替代方案，例如使用静态方法来计算state。



##### 简述diff算法

Diff算法是React用来比较Virtual DOM之间差异的算法。它的核心思想是将前后两个Virtual DOM进行比较，找到二者之间的差异，然后仅仅针对这些差异进行最小化的更新操作。

Diff算法包括以下三个步骤：

1. Tree Diff：对比两棵Virtual DOM树的差异，找出需要更新的节点。

2. Component Diff：针对同一层级的节点，对比组件类型是否相同，相同则更新，不同则重新创建组件。

3. Element Diff：针对同一层级的同一个组件内的节点，进行节点的更新。

React在进行Diff算法比较时，采用了优化策略，将差异最小化。其中，Diff算法比较Virtual DOM时，采用了同层比较的策略，即比较两棵Virtual DOM树同一层级的节点，避免了跨层级比较，降低了复杂度。

在React 16之后，React还引入了Fiber架构，将组件的渲染过程分解为多个任务单元，实现了任务优先级的调度，从而进一步提升了Diff算法的效率。

总结：Diff算法是React实现高效更新Virtual DOM的核心算法之一，它通过最小化的更新操作，使得React在应对复杂UI界面时具有很高的性能和响应速度。



##### vue的diff算法和react的diff算法这两者异同点是什么

Vue和React都采用了Diff算法来实现高效更新Virtual DOM，但是它们的具体实现方式有所不同，下面是它们之间的异同点：

相同点：

1. 都采用了Virtual DOM机制：Vue和React都是通过对Virtual DOM进行比较来确定需要更新的DOM节点，而非直接操作DOM。

2. 都采用了同层比较策略：Vue和React都采用了同层比较的策略，即比较同一层级的节点，避免了跨层级比较，降低了复杂度。

3. 都尽可能地减少DOM操作：Vue和React都通过最小化的更新操作，使得需要更新的DOM节点尽可能少，以此提升性能和响应速度。

不同点：

1. 实现方式不同：Vue和React的实现方式有所不同，Vue的Diff算法是通过双向比较算法实现的，而React的Diff算法是通过单向比较算法实现的。

   1. Vue 的 Virtual DOM Diff 算法是通过双向比较算法实现的，它可以**同时对比新旧节点的差异**，并且在比较过程中，**尽可能地复用已有节点**，从而减少渲染次数，提高性能。这种算法可以在整棵虚拟 DOM 树中查找差异，但是实现相对较为复杂。

      而 React 的 Virtual DOM Diff 算法是通过单向比较算法实现的，它**仅从顶部开始比较新旧节点的差异**，**如果找到了不同的节点，则会将该节点及其子树全部重新渲染，而不会尝试复用已有节点**。这种算法相对简单，但是可能会导致不必要的渲染和性能损失。

      需要注意的是，Vue 和 React 的 Virtual DOM Diff 算法**都是基于最长递增子序列**（Longest Increasing Subsequence, LIS）算法的优化实现。Vue 采用了**两端对比**的方式，从而实现了双向比较，而 React 则采用了**单向遍历**的方式，以提高算法效率

      

      “**两端对比**”是指在 Virtual DOM Diff 算法中，同时从新旧节点的两端开始对比，以尽可能复用已有节点，减少渲染次数，提高性能的方式。

      具体来说，两端对比是在新旧节点的子节点列表中，从头和尾同时开始遍历，依次比较对应位置上的节点是否相同，如果相同，则将这些节点进行复用，同时将遍历指针向中间移动一位。如果不同，则停止对比，将剩余的节点全部进行渲染。

      采用两端对比的方式，可以在整棵虚拟 DOM 树中查找差异，并尽可能地复用已有节点，从而减少渲染次数，提高性能。Vue 框架中的 Virtual DOM Diff 算法就采用了两端对比的方式。

      需要注意的是，采用两端对比的方式虽然可以提高算法效率，但同时也增加了算法的复杂度和实现难度。因此，在具体实现中需要权衡算法的效率和复杂度，选择最适合实际应用场景的方式。

      

2. 粒度不同：Vue的Diff算法对比的粒度更细，因为Vue在比较时会比较每个节点的属性值和子节点，而React则只比较同一层级的节点。

3. 对列表渲染的优化方式不同：Vue通过设置key来优化列表渲染，而React则采用了一些特殊的算法来优化列表渲染，例如在Diff算法中对列表节点的处理。

总结：Vue和React的Diff算法都是为了实现高效更新Virtual DOM，但是它们的具体实现方式有所不同，每个框架都有其独特的优化策略和实现方式。



##### react有哪些优化手段

React作为一种高效的前端开发框架，提供了许多优化手段来提升应用的性能和用户体验，其中一些常用的优化手段包括：

1. 使用PureComponent或shouldComponentUpdate生命周期方法：这些方法可以让React在渲染组件之前先检查它们的props和state是否发生了变化，如果没有变化，就可以跳过渲染，从而提高性能。

2. 使用React.memo进行函数组件的记忆化：通过React.memo可以对函数组件进行记忆化处理，如果组件的props没有发生变化，就可以跳过渲染，提高性能。

3. 使用React.lazy和Suspense来优化代码分割：React.lazy和Suspense可以让React实现按需加载组件，从而避免在初始渲染时加载过多的代码，提高应用的性能。

4. 使用useCallback和useMemo来优化函数组件：useCallback和useMemo可以让函数组件的逻辑更加高效，避免不必要的重新渲染和计算。

5. 使用shouldComponentUpdate和React.PureComponent优化类组件：shouldComponentUpdate和React.PureComponent可以让类组件避免不必要的渲染，提高应用性能。

6. 使用虚拟列表和无限滚动来优化长列表的渲染：虚拟列表和无限滚动可以让React只渲染可见的部分列表项，从而避免在渲染大型列表时导致的性能问题。

7. 使用React.memo和React.useMemo来优化大型表单和数据可视化组件：通过React.memo和React.useMemo可以避免在渲染大型表单和数据可视化组件时不必要的计算和渲染，提高应用性能。

总结：React提供了许多优化手段来提高应用的性能和用户体验，开发者可以根据实际情况选择适合自己应用的优化策略。



##### 说说virtual Dom的理解

Virtual DOM（虚拟DOM）是React中的一个重要概念，它是一种轻量级的JavaScript对象树，用于描述真实DOM的结构和内容。在React中，当数据发生变化时，React会通过比较新旧虚拟DOM的差异来确定需要更新的DOM节点，并且只更新需要更新的部分，这样可以避免不必要的DOM操作，提高应用的性能。

虚拟DOM的基本思想是将DOM抽象成JavaScript对象，通过比较新旧虚拟DOM的差异，确定需要更新的部分，然后再将差异部分应用到真实DOM上，从而实现高效的DOM更新。由于JavaScript对象比DOM操作要快很多，因此虚拟DOM可以大幅提高React应用的性能。

在React中，通过JSX语法定义组件时，会生成对应的虚拟DOM树。当组件的状态或属性发生变化时，React会重新生成新的虚拟DOM树，并将其与之前的虚拟DOM树进行比较。这个过程被称为“协调（reconciliation）”，在协调的过程中，React会通过Diff算法找出新旧虚拟DOM树之间的差异，并将这些差异应用到真实DOM上。

总之，虚拟DOM是React中的一个重要概念，它是一种轻量级的JavaScript对象树，用于描述真实DOM的结构和内容。通过比较新旧虚拟DOM的差异，React可以确定需要更新的DOM节点，并且只更新需要更新的部分，从而提高应用的性能。



##### 你对合成事件的理解，并解答下面问题：

- 我们写的事件是绑定在dom上么，如果不是绑定在哪里？
- 为什么我们的事件手动绑定this(不是箭头函数的情况)
- 为什么不能用 return false 来阻止事件的默认行为？
- react怎么通过dom元素，找到与之对应的 fiber对象的？

合成事件的理解：合成事件是React中用于处理用户交互的一种机制，它是**基于事件委托（event delegation）实现的**。事件委托是指将事件绑定到一个共同的父节点上，而不是将事件绑定到每个子节点上，从而减少事件绑定的次数，提高性能。

具体来说，当用户触发一个事件时，React会将事件包装成一个合成事件（SyntheticEvent），并将其传递给事件处理函数。合成事件包含了一些额外的属性和方法，可以提供更加便捷的操作方式，例如获取当前事件的目标元素、阻止默认行为、停止事件冒泡等。

解答问题：

1. 我们写的事件并不是直接绑定在DOM元素上的，而是通过事件委托机制绑定在最外层容器上，当事件触发时，React会根据事件的冒泡路径找到对应的组件并调用相应的事件处理函数。
2. 由于普通函数内部的this指向是动态的，所以在事件处理函数中如果需要使用组件实例的属性或方法，需要手动绑定this。在类组件中可以使用箭头函数或在构造函数中绑定this来绑定事件处理函数的this，而在函数组件中可以使用useCallback和useMemo来缓存函数并绑定this。
3. 在React中，使用事件对象的preventDefault()方法来阻止事件的默认行为，使用stopPropagation()方法来停止事件冒泡。使用return false来阻止事件默认行为的做法是jQuery等库中的行为，React并不支持。
4. React通过Fiber树来实现组件的更新和渲染，每个Fiber节点都对应一个组件实例或DOM元素。当事件触发时，React会遍历Fiber树找到与目标DOM元素对应的Fiber节点，并调用相应的事件处理函数。具体来说，React会在Fiber树上找到最近的有事件处理函数的祖先节点，并沿着Fiber树向下递归查找目标元素对应的Fiber节点。

拓展3:	为什么不能用 return false 来阻止事件的默认行为？

在 React 中，使用 `return false` 来阻止事件默认行为是无效的，需要使用 `event.preventDefault()` 方法来阻止事件的默认行为。这是因为 React 实现了自己的 SyntheticEvent 合成事件系统，通过该系统实现了跨浏览器的兼容性。在这个合成事件系统中，`return false` 并不能正确地阻止事件的默认行为。

拓展4：React 怎么通过 DOM 元素，找到与之对应的 Fiber 对象的？

在 React 中，每个组件被渲染为一个 Fiber 对象，Fiber 对象中保存了组件的状态、属性、子节点等信息。而 DOM 元素在 React 中也被封装成了一个对象，称为 ReactElement，其中包含了该元素的类型、属性、子元素等信息。

React 通过在 DOM 元素上设置一个称为 `__reactInternalInstance` 的属性来关联 DOM 元素和对应的 Fiber 对象。该属性指向一个包含 Fiber 对象引用的对象，从而实现了 DOM 元素和 Fiber 对象的关联。这个属性在开发者工具中可以看到，但是不应该在应用代码中直接使用。



##### 点击Father组件的div，Child会打印Child吗

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

当点击 Father 组件的 div 元素时，Child 组件并不会打印，只会重新渲染。这是因为 React 会对整个组件树进行重新渲染，而不是只重新渲染更改了状态的组件。在这个例子中，当点击 Father 组件的 div 元素时，会更新 Father 组件的状态，导致整个组件树重新渲染。
React会首先渲染App组件，接着渲染Father组件，最后渲染Child组件。在渲染Child组件的过程中，会打印一次"Child"，同时返回一个div元素作为Child组件的渲染结果。接着，渲染Father组件的过程中，会将Child组件作为props.children传递给Father组件，这个时候React会再次渲染Child组件，因此会再次打印一次"Child"，同时返回另一个div元素作为Child组件的渲染结果。所以在初始化时会打印两次"Child"。
```



##### 打印顺序是什么

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

react的初始化渲染顺序是：
单组件：主线程->render->effect；
多层级嵌套组件:父组件主线程->父组件render->子组件主线程->子组件render->孙组件主线程->孙组件render->孙组件effect->子组件effect->父组件effect

react的更改状态时的渲染顺序是：
主线程->render->清理/卸载函数->effect;
```



##### useLayoutEffect/componentDidMount和useEffect的区别是什么

`useLayoutEffect` 和 `componentDidMount` 都在组件挂载时执行，不过它们的调用时机略有不同。

`useLayoutEffect` 会在浏览器 layout 和 paint 之前执行，因此它的执行时机比 `componentDidMount` 更早。这样可以确保浏览器在页面渲染前更新了 DOM，防止用户看到闪烁的页面。另外，由于 `useLayoutEffect` 会阻塞组件的渲染，因此应该尽量避免执行耗时的操作。

而 `useEffect` 则是在浏览器 layout 和 paint 之后执行，因此它的执行时机比 `componentDidMount` 更晚。如果在 `useEffect` 中执行一些对视觉渲染无影响的操作，可以选择 `useEffect`。

另外，`useLayoutEffect` 和 `componentDidMount` 都是针对类组件和函数式组件的生命周期钩子，而 `useEffect` 是 React 16.8 引入的 Hook。使用 Hook 可以方便地在函数式组件中使用生命周期钩子。



##### react hooks的底层逻辑及原理

React Hooks 底层是通过一种叫做 Fiber 的数据结构来实现的。Fibber是一种新的协调机制，用于实现增量渲染和调度更新，同时还能支持并发渲染和异步渲染。在 Fiber 中，每个组件都会被表示为一个 Fiber 节点，这个节点包含了组件的状态、props 和其他相关信息。在组件的生命周期中，Fiber 节点会根据需要被创建、删除、修改和重用。

每个组件的 Fiber 节点都会维护一个 Hooks **链表**，这个链表中存储了该组件使用的所有钩子函数。当组件被更新时，React 会根据 Hooks 链表中的顺序依次调用这些钩子函数，从而更新组件的状态和执行其他副作用。



##### react-router的keepalive属性原理和vue-router的keepAlive组件原理及对比

在 **React-Router** 中，`keepalive` 属性是一个自定义属性，它用于缓存路由组件的状态和 DOM 结构，避免组件在每次切换路由时都重新渲染。

React-Router 的 `keepalive` 属性并不是官方提供的，它是通过第三方库 `react-activation` 实现的。`react-activation` 库利用 React-Router 的生命周期函数，实现了缓存和恢复路由组件状态的功能。

具体实现方式如下：

1. 在路由配置中，将需要缓存的路由组件用 `withActivation` 高阶组件进行包裹，同时在 `Route` 组件上添加 `keepAlive` 属性。

2. `withActivation` 高阶组件会将路由组件包裹在一个缓存容器组件中，同时通过 React-Router 的 `location.key` 属性作为缓存容器组件的唯一标识。

3. 缓存容器组件内部，使用 React-Router 提供的 `useLocation` 钩子函数获取当前路由的 `location` 对象，通过比对 `location.key` 属性和缓存容器组件的标识，判断当前路由是否需要缓存。

4. 如果需要缓存，则将缓存容器组件的状态和 DOM 结构存储在 `react-activation` 库提供的缓存池中。

5. 如果不需要缓存，则直接渲染路由组件，并销毁缓存容器组件。

6. 在切换路由时，通过 React-Router 的 `location.key` 属性获取对应的缓存容器组件，从缓存池中恢复其状态和 DOM 结构，并重新渲染到页面上。

由此可见，`keepalive` 属性的实现原理是通过缓存容器组件和缓存池来实现的，使得需要缓存的路由组件可以实现状态和 DOM 结构的复用，从而提高路由切换的性能。

在 **Vue-Router** 中，`keep-alive` 是一个内置的组件，用于缓存路由组件的状态和 DOM 结构，以避免组件在每次切换路由时都重新渲染。`keep-alive` 组件的原理可以分为以下几步：

1. 在路由配置中，将需要缓存的路由组件包裹在 `keep-alive` 组件中。

2. 在 `keep-alive` 组件内部，将被缓存的路由组件缓存到一个名为 `cache` 的对象中，以路由名称为 key，缓存的组件实例为 value。

3. 在渲染路由组件时，判断当前组件是否需要缓存。如果需要缓存，则从 `cache` 对象中获取缓存的组件实例，否则直接渲染新的组件实例。

4. 在缓存路由组件时，将其状态和 DOM 结构存储在 `keep-alive` 组件内部，以便在下次使用时进行恢复。

5. 在切换路由时，如果目标路由需要缓存，则从 `cache` 对象中获取缓存的组件实例并将其重新渲染到页面上。否则直接渲染新的组件实例。

总的来说，`keep-alive` 组件的原理与 React-Router 中的 `keepalive` 属性类似，都是通过缓存容器组件和缓存池来实现路由组件的状态和 DOM 结构的复用，从而提高路由切换的性能。不同的是，在 Vue-Router 中，`keep-alive` 组件是内置的，可以直接使用，而在 React-Router 中，需要通过第三方库来实现。



##### fibber调度任务时的时间分配

fibber调度任务时的时间分配是通过任务开始前的时间戳，和任务当前时间戳的时间差，同预估时间进行比对，这是为了兼容性，而没有用requestIdleCallBack;

##### requestIdleCallback

`requestIdleCallback` 是一个用于在主线程空闲时执行回调函数的 API。它允许开发者安排任务在浏览器的主线程空闲时执行，以避免阻塞关键的渲染和用户交互操作。

`requestIdleCallback` 的基本语法如下：

```javascript
window.requestIdleCallback(callback[, options]);
```

其中，`callback` 是要执行的回调函数，`options` 是一个可选的配置对象，可以指定超时时间和回调执行优先级等。

在使用 `requestIdleCallback` 进行数据分片处理时，你可以将每个数据分片的处理逻辑放在回调函数中，以便在主线程空闲时执行。以下是一个示例：

```javascript
// 将大量数据分割成数据分片
const dataChunks = [...];

// 定义处理函数
function processDataChunk(chunk) {
  // 执行数据分片的处理逻辑
  // ...
}

// 使用 requestIdleCallback 调度数据分片处理
let currentIndex = 0;

function scheduleDataProcessing(deadline) {
  while (currentIndex < dataChunks.length && deadline.timeRemaining() > 0) {
    const currentChunk = dataChunks[currentIndex];
    processDataChunk(currentChunk);
    currentIndex++;
  }

  if (currentIndex < dataChunks.length) {
    window.requestIdleCallback(scheduleDataProcessing);
  }
}

window.requestIdleCallback(scheduleDataProcessing);
```

在上述示例中，我们使用 `window.requestIdleCallback` 调度数据分片的处理。在 `scheduleDataProcessing` 函数中，我们在主线程空闲时不断地处理数据分片，直到遍历完所有分片或超过了空闲时间限制。如果还有未处理的数据分片，我们再次使用 `window.requestIdleCallback` 调度下一轮的处理。

通过利用 `requestIdleCallback`，你可以在主线程空闲时分批处理数据分片，避免阻塞关键任务，并提高用户体验。请注意，`requestIdleCallback` 目前还是一个实验性的 API，支持程度可能会因浏览器而异。因此，应该使用降级策略或 polyfill 来确保在不支持的浏览器上有备选方案。



##### 为什么fiber中的节点是链表形式

Fiber 中的节点采用链表形式主要是为了支持增量更新和任务调度的需求。这种链表结构被称为 Fiber 树，它以节点之间的链表连接来表示组件树的结构。

以下是一些原因解释为什么选择链表形式：

1. 支持增量更新：在 React 中，当组件需要更新时，会触发整个组件树的重新渲染。而采用链表形式的 Fiber 树可以支持增量更新，即只更新需要更新的部分，而不是重新渲染整个组件树。链表结构使得 React 可以在更新过程中暂停、中断和恢复，灵活地处理更新任务的优先级和顺序。

2. 支持任务调度：React 在进行组件更新时，使用了一种任务调度算法，它可以根据任务的优先级和类型来动态地安排任务的执行顺序。链表结构的 Fiber 树能够方便地进行任务调度，因为它可以轻松地更改节点之间的连接顺序，调整任务的执行顺序。

3. 节省内存：使用链表结构可以节省内存空间。相比于树形结构，链表不需要为每个节点额外存储子节点的引用，只需要存储下一个节点的指针即可。这在大型组件树中可以显著减少内存占用。

总的来说，Fiber 中采用链表形式的节点结构是为了支持 React 的增量更新和任务调度机制，提高更新性能和用户体验。链表结构具有灵活性、节省内存的特点，使得 React 能够更加高效地处理组件树的更新和渲染。



##### 详细描述下事件循环

事件循环（Event Loop）是 JavaScript 中处理异步操作的机制。它负责管理执行代码和处理事件的顺序，确保正确地执行异步任务。下面是事件循环的详细描述：

1. 执行同步代码：当 JavaScript 运行时开始执行代码时，首先会执行主线程中的同步代码，按照顺序依次执行。同步代码是指没有异步操作或者没有回调函数的代码，它们会立即执行并完成。

2. 处理消息队列：在执行同步代码的过程中，如果遇到异步操作（例如定时器、网络请求、事件监听等），这些异步操作将被放置在消息队列中等待执行。消息队列是一个先进先出（FIFO）的队列结构。

3. 检查调用栈：当主线程中的同步代码执行完成后，事件循环会检查调用栈（Call Stack）是否为空。调用栈是用于记录函数调用的一种数据结构。如果调用栈为空，说明主线程当前没有执行的代码。

4. 执行异步任务：如果调用栈为空，事件循环会从消息队列中取出一个异步任务并将其放入调用栈中执行。这个异步任务可能是一个回调函数或者一个宏任务（比如定时器触发的任务）。执行异步任务时，可能会产生新的异步任务，它们会被放入消息队列中等待执行。

5. 重复循环：事件循环会不断重复上述步骤，即先执行同步代码，然后检查调用栈，执行异步任务。这个过程会持续进行，直到调用栈和消息队列都为空。

需要注意的是，事件循环并不是单纯按照步骤依次执行的。它涉及到宏任务和微任务的概念：

- 宏任务（macrotask）：宏任务代表较大的任务单元，通常包括整体的一段代码，例如 setTimeout、setInterval、I/O 操作等。宏任务会被放置在消息队列中，每次只执行一个宏任务。

- 微任务（microtask）：微任务是相对较小的任务单元，通常是由宏任务执行过程中产生的任务。常见的微任务包括 Promise 的回调、MutationObserver 和 process.nextTick 等。微任务会在当前宏任务执行完毕后立即执行，而不会被放置在消息队列中。

事件循环会优先处理微任务，直到微任务队列为空，然后才会执行下一个宏任务。这保证了微任务可以更快速地执行，并且微任务的执行顺序比宏任务更靠前。

总结起来，事件循环负责协调同步代码和异步任务的执行顺序，通过消息队列和调用栈来管理任务的执行

##### 宏任务和微任务哪个先执行

在事件循环中，微任务（microtask）会先于宏任务（macrotask）执行。

具体的执行顺序如下：

1. 执行同步代码。
2. 检查是否有微任务需要执行。如果有，依次执行所有的微任务，直到微任务队列为空。
3. 执行宏任务。
4. 检查是否有新的微任务产生。如果有，将其添加到微任务队列中。
5. 如果存在其他的宏任务，执行下一个宏任务，回到第2步。
6. 如果没有微任务和宏任务，事件循环等待新的任务进入。

总结来说，事件循环首先执行同步代码，然后依次执行微任务队列中的所有微任务，再执行一个宏任务。执行完当前的宏任务后，检查是否有新的微任务产生，如果有，立即执行这些微任务，然后再执行下一个宏任务。这样的循环持续进行，直到微任务队列和宏任务队列都为空。

需要注意的是，微任务的执行优先级比宏任务高，即使在宏任务执行过程中产生了新的微任务，它们也会在当前宏任务执行完毕前被立即执行。这种机制确保了微任务能够及时响应并处理一些重要的操作，例如 Promise 的回调函数或者 DOM 的变更。
