console.log('begin')

setTimeout(() => {
  console.log('setTimeOut123')
})


new Promise((resolve) => {
  console.log('promise')
  resolve()
}).then(() => {
  console.log('then1')
}).then(() => {
  console.log('then2')
})

setTimeout(() => {
  console.log('setTimeOut456')
})

console.log('end')