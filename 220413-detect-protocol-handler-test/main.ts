function checkRegisteredProtocol(protocol) {
  const input = document.createElement('input');
  input.style.position = 'absolute';
  input.style.opacity = '0';
  document.body.appendChild(input);
  let isSupported = false;
  input.focus();
  input.onblur = () => isSupported = true;
  location.href = `${protocol}://test.com`;
  return new Promise(res => {
    setTimeout(() => {
      res(isSupported);
      document.body.removeChild(input);
    }, 300);    
  });
}

for (const name of ['slack', 'figma', 'test']) 
  document.getElementById(name).onclick = async () => {
    const supported = await checkRegisteredProtocol(name);
    console.log(name, supported);
  };