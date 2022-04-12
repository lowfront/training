# serverless 라이브러리 AWS Nodejs 테스트

serverless 라이브러리는 lambda의 업로드 대상이 되는 s3 버킷 생성기능은 없음. service-lambda-to-s3 버킷은 수동으로 생성해야 함.

```
sls deploy
```
해당 명령어 실행 후 출력되는 endpoint로 POST request보내면 service-lambda-to-s3 버킷에 난수 이름의 파일 생성됨.

```js
fetch(`<endpoint>`, {
  method: 'POST',
});
```

`serverless-dotenv-plugin` 플러그인 테스트 -> 작동하지 않음
[링크](https://github.com/neverendingqs/serverless-dotenv-plugin/discussions/155)에 따르면 serverless 3.0.0 이상 버전은 해당 플러그인을 지원하지 않는다고 함. 일단 네이티브와 스크립트로 환경변수를 사용해야 할 듯.

[링크](https://www.serverless.com/framework/docs/guides/dashboard#supported-runtimes-and-regions)에 따르면 현재 서울(ap-northeast-2) 지역은 serverless의 대쉬보드 기능을 지원하지 않음.