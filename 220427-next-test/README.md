# getStaticPaths fallback 속성 확인
- false : 확인되지 않은 url에 대한 요청은 404 처리
- true : 대상 path 업데이트를 모두 빌드하지않고 요청받은 페이지만 업데이트 확인. 요청 받았을때는 이전 페이지보여준 후, 업데이트 가능하면 업데이트 중에는 fallback 페이지 표시 후 업데이트 완료 후 최종 데이터 렌더링, 없는 페이지는 404, getStaticProps의 revalidate랑 같이 설정하면 새로운 페이지만 빌드 가능
- blocking : 없는 페이지는 404가 아니라 서버에러 발생, 페이지 빌드전에 fallback 페이지대신 빈화면을 보여주고 빌드 완료되면 최종 데이터 렌더링, getStaticProps의 revalidate랑 같이 설정하면 새로운 페이지만 빌드 가능