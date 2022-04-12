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