function asyncMap(promiseFns, max) {
  const result = [];

  let count = 0;
  let cursor = 0;

  return new Promise(res => {
    function run() {
      while (count < max && cursor < promiseFns.length) {
        count++;
        const index = cursor++;
        promiseFns[index]()
          .then((value) => {
            result[index] = value;
          }, rej => console.log(rej))
          .catch(err => console.error(err))
          .finally(() => {
            run();
            count--;
  
            if (!count) res(result);
          });
      }
    }
  
    run();
  });
}

asyncMap(Array(30).fill(async () => {
  return new Promise(res => {
    const img = new Image;
    img.onload = () => {
      res();
      console.log('[load complete]', img.src);
    }
    img.src = `https://picsum.photos/300/300?${Math.floor(Math.random() * 100 + 1)}`;
  });
}), 5).then(console.log);