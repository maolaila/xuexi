function callback2() {
  console.log(2)
}

function callback() {
  console.log(1)
  setTimeout(callback2, 0)
}

setTimeout(callback, 0)
