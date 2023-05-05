var arrayLike = {
  0: '0',
  1: '1',
  length: 2,
}

// console.log(arrayLike.length)
// arrayLike.push = Array.prototype.push.bind(arrayLike);

// arrayLike.push('asd');
// console.log(arrayLike)

Function.prototype.myCall = function(thisArg, ...args) {
  // 如果this不是函数，则抛出TypeError异常
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.call called on non-function');
  }

  // 如果thisArg为null或undefined，则this指向全局对象
  if (thisArg === null || thisArg === undefined) {
    thisArg = window;
  }

  // 将函数作为对象的方法调用，并传递参数
  const fn = Symbol('fn');
  thisArg[fn] = this;
  console.log(this.name, 'this')
  const result = thisArg[fn](...args);

  // 删除临时属性
  delete thisArg[fn];

  // 返回函数调用的结果
  return result;
};
for(var i = 0; i <= 5; i++) {
  // setTimeout(j => {
  //   console.log(j)
  // }, 1000, i)
  setTimeout(() => {
    console.log(i)
  }, 0)
}