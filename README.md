# javascript-convenience-store-precourse

## 기능 명세서

### md파일

md파일을 읽어서 올바른 데이터형식으로 파싱하는 과정이 필요
재고를 차감하는 메서드 필요
재고를 항상 최신 상태로 유지해야 함
md파일에 재고 현황을 반영해야 함

### 입력

구매 상품과 수량은 하이픈(-)으로, 개별 상품은 대괄호로 묶어 쉼표로 구분
정규식으로 입력 형식 검증
입력된 상품이 재고목록에 있는지 검증
0개를 산 경우 에러
재고가 있는지 검증 -> 프로모션 재고까지 고려

### 프로모션

프로모션 상품인지 검증

- 상품이 promotion에 있는지 확인
- 프로모션 기간인지 확인

프로모션 적용 상품의 수량보다 고객의 수량이 적음

- Y : 증정 받을 수 있는 상품을 추가한다.
- N : 증정 받을 수 있는 상품을 추가하지 않는다.

고객의 수량이 더 많아 프로모션 혜택없이 결제해야됨. 일부 수량에 대해 정가로 결제할것인지 입력.

- Y: 일부 수량에 대해 정가로 결제한다.
- N: 정가로 결제해야하는 수량만큼 제외한 후 결제를 진행한다.

### 테스트목록

- 프로모션 상품일때
  프로모션 재고에서 결제수량+1 만큼 차감한다.

  재고보다 적을 때 추가로 구매할 건지 물어봄 (단, 프로모션재고가 충분한 경우)
  Y라면, 남은 결제수량 + 추가한 프로모션 수량 + 증정 수량을 차감한다.
  N이라면, 남은 결제수량을 차감한다.

  프로모션 재고가 부족해서 일반 재고에서 차감해야 할 때
  Y인데, 일반재고가 충분한 경우는 그대로 실행
  Y인데, 일반재고가 부족한 경우는 프로모션 재고까지 원상복구
