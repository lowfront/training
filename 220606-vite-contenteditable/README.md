# Simple Editor Example

HTML 붙여넣기 및 스타일링 기능 포함한 간단한 편집기 예제. 텍스트 입력시 DFS방식으로 노드 탐색 후 모든 노드를 플랫하게 처리하고 스타일 제거해서 표현. Google Keep의 링크 변환 개발 예정. 편집기능을 추가하는 것이 간단한 작업이 아닌것으로 보임

## 붙여넣기 HTML 파싱 규칙
텍스트 에디터에서 글쓰기와 붙여넣기 모두 이 방식으로 노드를 정리한다.
- 파싱은 DFS(깊이우선) 순서로 진행한다. (첫번째 자식을 타고 확인해야하는 조건이 많음)
- Root 노드는 block(줄넘김) 속성을 갖지 않는다.
- Root 노드의 block 방지 속성은 첫번째 자식 노드에게 재귀적으로 상속
- Block(줄넘김) 속성을 갖고 있는 노드는 첫번째 자식 노드에게 재귀적으로 상속
- Block 노드의 block 속성은 가장 끝에 있는 자식 노드로 BR 태그를 만나면 무효화(줄넘김 방지) 된다.
- BR 태그는 트리파싱의 다음 순서에 오는 형제노드에게 block 속성을 부여한다.
- Block 속성의 태그는 다음 순서에 오는 형제노드에게 block 속성을 부여한다.
- PRE 태그는 모든 속성 무시하고 개행문자(\n) 기준으로 텍스트와 노드 분할

## 줄넘김 규칙
- 현재 커서가 위치한 텍스트 노드와 텍스트 노드 위의 커서위치를 Selection 객체에서 확인
- 현재 커서 기준으로 텍스트 노드를 2개로 분리
- 분리한 텍스트 노드 사이에 BR 태그 삽입
- 텍스트 노드는 setStart 메소드에 그대로 넘겨서 포커싱하고, BR 태그는 포커싱이 잡히지 않으므로 부모태그를 넘기고 offset으로 포커싱
- 포커싱 노드가 부모노드와 같으면 텍스트 노드가 존재하지 않으므로 텍스트 노드 분리하는 대신 BR 태그만 입력
- 내용이 없는 초기상태에는 엔터 입력시 BR 두번 삽입해야 줄넘김 포커싱 가능
- BR 입력시 다음 노드 중 BR이 없으면(처음 BR 입력) 두 번 입력하고 뒤쪽 BR로 포커싱
- BR 입력시 다음 노드 중 BR이 있으면(이미 BR이 있음) 한 번 입력하고 뒤쪽 BR로 포커싱
- 내용 더 단순하게 정리
- 한글 조합중 줄넘기면 BR이 하나 더 삽입되는 버그 있음

## 링크 A 태그 변환 규칙 (작업중)
- 입력이 끝나면 현재 포커스 정보 저장
- 입력이 끝나면 nodeValue만 이용한 비교로 텍스트에 링크가 포함되어있는지 검사
- 링크를 포함한 라인은 텍스트와 링크를 나눠서 각각 Text와 HTMLAnchorElement로 변환
- 변환된 노드 구조를 HTML 스트링으로 변환하고 에디터 노드로 HTML에 대입
- 저장된 포커스정보로 에디터 노드 포커스 재설정

## 필요한 로직 정리
- contenteditable 속성 사용한 노드에 포커싱이 일어나는 경우 window.getSelection 속성으로 현재 포커싱된 노드를 알 수 있으나 어떤 종류의 노드냐에 따라서 Selection 객체가 다른 값으로 나타나게 됨
- contenteditable 속성 사용하면 붙여넣기를 통해 가능한 모든 DOM 구조가 입력될 수 있으므로, DOM 구조를 파싱하여 flat하게 변환하는 파서를 필요로 함
- 태그 변환시 파싱 결과를 토대로 모든 노드를 변경하면 Selection을 분석해서 기억하고 새로 변한 노드 중 해당하는 노드에 다시 계산해서 포커싱해야하는데 상당히 복잡한 작업이라, 기존 생성된 노드를 필요한 만큼 변형하는 방식으로 변환하고 포커싱도 최소한으로 변경

### Next Step
- [x] 붙여넣기 엔터 정확히 반영
- [x] pre, code 태그 파서
- [] 포커싱 함수 구현
- [] 링크감지 후 a 태그로 변환
- [] 커서 기준으로 중첩된 태그 나누기