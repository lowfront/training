# serverless esm 테스트

serverless dashboard에 코드를 추가하면 esm을 사용할 수 없음. 작성된 코드 import 이전에 serverless dashboard에 호출결과를 보내는 래퍼 코드 추가되는데 cjs방식으로 추가됨. 그 외에는 mjs 확장자를 통해 esm 사용 가능.