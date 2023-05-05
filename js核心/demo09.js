async function async1() {
  console.log('async1 start')
  await async2();
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

async1()

setTimeout(() => {
  console.log('timeout')
})

new Promise((resolve) => {
  console.log('promise1')
  resolve()
}).then(() => {
  console.log('promise2')
}) 

console.log('end')