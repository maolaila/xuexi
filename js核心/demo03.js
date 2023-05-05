function testAwait() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      console.log('testAwait');
      res();
    }, 1000)
  })
}

async function use() {{
  await testAwait();
  console.log('321')
}}


function test1() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res([1,2,3])
      console.log('test1')
    }, 1000)
  })
}

function test2() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({a:1});
      console.log('test2')
    }, 1000)
  })
}

function test3() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      rej('err-test3')
      console.log('test3')
    }, 1000)
  })
}

// Promise.all([test1(), test2(), test3()]).then(res => {
//   console.log(res, 'ress')
// }).catch(err => console.log(err, 'err'))

// Promise.allSettled([test1(), test2(), test3()]).then(res => {
//   console.log(res, 'ress')
// })

Promise.any([test1(), test2(), test3()]).then(res => {
  console.log(res, 'ress')
})