function test1() {
  return new Promise((res, rej) => {
    res('123')
  });
}


test1().then(res => {
  console.log(res, 'res')
  return '456'
}).then(res1 => {
  console.log(res1, 'res1')
})