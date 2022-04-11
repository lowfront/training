# serverless 라이브러리 AWS Nodejs 테스트

service-lambda-to-s3 버킷은 수동으로 생성해야 함.

```
sls deploy
```
해당 명령어 실행 후 출력되는 endpoint로 POST request보내면 service-lambda-to-s3 버킷에 난수 이름의 파일 생성됨.

```js
fetch(`<endpoint>`, {
  method: 'POST',
});
```