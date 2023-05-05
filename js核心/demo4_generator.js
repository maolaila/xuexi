function test1() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        res("success");
      } else {
        rej("error")
      }
    }, 1000)
  }).then(res => res)
}

function* gen() { 
  let data1 = yield test1();
  console.log(data1, 'data1')
  let data2 = yield test1();
  console.log(data2, 'data2')
  let data3 = yield test1();
  console.log(data3, 'data3')
}

let g = gen();
g.next()
g.next()
g.next()
g.next()