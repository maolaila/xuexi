var arr = [1,2,31,4,5.6,7];


var res = arr.reduce((pre, next) => {
  return pre > next ? pre : next;
}, arr[0])

console.log(res)

function test(...args) {
  console.log(arguments)
  console.log(args)
  console.log(Object.prototype.toString.call(arguments))
}

test("a", "cqwe", 123, '321', 'dsa')