# Electron 쿠키 정리

Electron의 쿠키는 main 프로세스의 session 객체에 있는 defaultSession 필드 안에 cookies 객체로 관리할 수 있다. 브라우저에서 관리하는 쿠키와 달리, 쿠키에 설정할 수 있는 필수 속성에 url 속성이 추가로 있다. Electron은 브라우저와 달리 main 프로세스와 renderer 프로세스가 나뉘어져 있고 화면에 렌더링 되는 페이지외에 native 코드를 main 프로세스에서 실행할 수 있다. 이때 앞서 서술한 쿠키는 main 프로세스에서 설정하면 renderer 프로세스에서 저장된 것을 확인할 수 있다.

Electron 쿠키에 설정하는 url 속성은 renderer 프로세스에서 url을 보여주는 경우 해당 url에 저장하고 있을 쿠키를 설정하기 위해 지정하는 속성이다. 참고할 점은 renderer 프로세스의 개발자모드에서는 현재 보여주는 url에 대한 쿠키밖에 보이지 않는다. 저장된 모든 쿠키를 확인하려면 cookies객체의 get 메소드를 사용해서 저장된 쿠키들을 확인할 수 있다. 개발자 도구에서는 현재 url에 해당하는 쿠키밖에 보여주지 않지만 Electron은 브라우저와 같이 각 url에 대한 쿠키를 모두 저장하고 있는 것이다.

Electron renderer 프로세스의 페이지를 렌더링할때 사용되는 get 요청의 경우, 저장된 url이 일치하는 cookie값이 요청헤더의 쿠키값으로 전달되어 서버에서 Electron에 저장된 쿠키값을 확인할 수 있다. Renderer 프로세스에서 XHR이나 fetch를 통해 credentials을 전달하는 경우에는 해당 코드를 실행하는 location과 Electron에 쿠키에 저장된 url속성이 같아야 쿠키가 전송된다. Location과 쿠키 url 속성이 다른 경우에는 credentials 옵션을 주더라도 renderer 프로세스에서 쿠키를 감지하지 못하고 전달하지도 못한다.

Electron의 WebRequest 클래스는 renderer 프로세스의 요청을 가로채고 수정할 수 있음. Renderer프로세스에서 요청이 생성될 때, 브라우저 정책에 의해 location과 같은 url 속성을 가진 쿠키가 아니면 헤더에 포함되지 않고 생성이 됨. WebRequest 클래스의 onBeforeSendHeaders 메소드를 사용해서 요청 발송전에 헤더를 확인하고 요청하는 url에 따라 Electron main 프로세스에 저장된 쿠키를 불러와서 쿠키 헤더를 설정해줄 수 있음. 이때 renderer 프로세스는 credentials 설정을 하지 않아도 쿠키 전달이 가능해지므로, 이 부분은 기본 작동방식과 달라지게 되니 개발 문서상에 명시할 필요가 있을 것으로 보임.

```js
// https://www.electronjs.org/docs/latest/api/web-request#class-webrequest
const { session } = require('electron');

const filters = {
  urls: ['<url>'],
};

session.defaultSession.webRequest.onBeforeSendHeaders(filters, async (details, cb) => {
  try {
    const cookies = await session.defaultSession.cookies.get({ url: '<url>' });
    const cookieHeader = cookies.map(({name, value}) => `${name}=${value}`).join(';');
    details.requestHeaders.cookie = cookieHeader;
    cb({requestHeaders: details.requestHeaders});
  } catch {
    cb({});
  }
});
```

위 코드와 같이 credentials 헤더를 수동으로 추가할 수 있지만 특정 호스트에 대한 모든 요청을 대상으로 하기보다 renderer 프로세스에서 요청할 때, 플래그로 사용할 수 있는 헤더를 추가하거나 하는 방법을 사용하는 것이 좋을 것으로 생각됨. 예를 들면 다음과 같이 모든 url을 타겟으로 하고 렌더러 요청에 특정 헤더 필드가 있는 경우에만 쿠키를 추가해서 전달하도록 처리.

```js
// main process
const filters = {
  urls: [
    '*://*/*'
  ],
};

session.defaultSession.webRequest.onBeforeSendHeaders(filters, async (details, cb) => {
  try {
    if (!details.requestHeaders['electron-credentials']) return cb({});
    const cookies = await session.defaultSession.cookies.get({ url: details.url });
    const cookieHeader = cookies.map(({name, value}) => `${name}=${value}`).join(';');
    details.requestHeaders.cookie = cookieHeader;
    cb({requestHeaders: details.requestHeaders});
  } catch (err) {
    console.warn(err);
    cb({});
  }
});

// renderer process
fetch('http://localhost:8080', {
  headers: { 'electron-credentials': true }
});

```