const sleep = async ()=> {
    return new Promise(function(resolve, reject){
        //当异步代码执行成功时，我们才会调用resolve(...), 当异步代码失败时就会调用reject(...)
        //在本例中，我们使用setTimeout(...)来模拟异步代码，实际编码时可能是XHR请求或是HTML5的一些API方法.
        setTimeout(function(){
            console.log('成功');

            resolve("成功!"); //代码正常执行！
        }, 250);
    });
}

const run = async ()=> {
  var res = await sleep();
  console.log(res);
  console.log('run');
}

run();