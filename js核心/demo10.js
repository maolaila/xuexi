let bar;

function test1(cb) {
  cb();  // undefiend bar
}

// function test1(cb) {
//   process.nextTick(cb()) // 1 bar
// }

test1(() => {
  console.log(bar, 'bar')
})


bar = 1;
