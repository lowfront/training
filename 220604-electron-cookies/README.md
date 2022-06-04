# Electron 쿠키 정리

Electron의 쿠키는 main 프로세스의 session 객체에 있는 defaultSession 필드 안에 cookies 객체로 관리할 수 있다. 브라우저에서 관리하는 쿠키와 달리, 쿠키에 설정할 수 있는 필수 속성에 url 속성이 추가로 있다. Electron은 브라우저와 달리 main 프로세스와 renderer 프로세스가 나뉘어져 있고 화면에 렌더링 되는 페이지외에 native 코드를 main 프로세스에서 실행할 수 있다. 이때 앞서 서술한 쿠키는 main 프로세스에서 설정하면 renderer 프로세스에서 저장된 것을 확인할 수 있다.

Electron 쿠키에 설정하는 url 속성은 renderer 프로세스에서 url을 보여주는 경우 해당 url에 저장하고 있을 쿠키를 미리 설정하기 위해 지정하는 속성이다. 참고할 점은 renderer 프로세스의 개발자모드에서는 현재 보여주는 url에 대한 쿠키밖에 보이지 않는다. 저장된 모든 쿠키를 확인하려면 cookies객체의 get 메소드를 사용해서 저장된 쿠키들을 확인할 수 있다.

Electron renderer 프로세스의 location에 의한 get 요청의 경우, 저장된 url이 일치하는 cookie값이 요청헤더의 쿠키값으로 전달되어 서버에서 Electron에 저장된 쿠키값을 확인할 수 있다. Renderer 프로세스에서 XHR이나 fetch를 통해 credentials을 전달하는 경우에는 해당 코드를 실행하는 location과 Electron에 쿠키에 저장된 url속성이 같아야, 쿠키가 전송된다. Location과 쿠키 url 속성이 다른 경우에는 credentials 옵션을 주더라도 renderer 프로세스에서 쿠키를 감지하지 못하고 전달하지도 못한다.