import ProductValidator from '../src/utils/ProductValidator.js';

const mockParseData = [
  { name: '콜라', price: 1000, quantity: 10, promotion: '탄산2+1' },
  { name: '콜라', price: 1000, quantity: 10, promotion: 'null' },
  { name: '사이다', price: 1000, quantity: 8, promotion: '탄산2+1' },
  { name: '사이다', price: 1000, quantity: 7, promotion: 'null' },
  { name: '오렌지주스', price: 1800, quantity: 9, promotion: 'MD추천상품' },
  { name: '탄산수', price: 1200, quantity: 5, promotion: '탄산2+1' },
  { name: '물', price: 500, quantity: 10, promotion: 'null' },
  { name: '비타민워터', price: 1500, quantity: 6, promotion: 'null' },
  { name: '감자칩', price: 1500, quantity: 5, promotion: '반짝할인' },
  { name: '감자칩', price: 1500, quantity: 5, promotion: 'null' },
  { name: '초코바', price: 1200, quantity: 5, promotion: 'MD추천상품' },
  { name: '초코바', price: 1200, quantity: 5, promotion: 'null' },
  { name: '에너지바', price: 2000, quantity: 5, promotion: 'null' },
  { name: '정식도시락', price: 6400, quantity: 8, promotion: 'null' },
  { name: '컵라면', price: 1700, quantity: 1, promotion: 'MD추천상품' },
  { name: '컵라면', price: 1700, quantity: 10, promotion: 'null' },
];

describe('ProductValidator Private Method Tests', () => {
  test('올바른 형식의 입력', () => {
    const result = ProductValidator.test.validateRegex('[콜라-2]');
    expect(result[0]).toBe('[콜라-2]');
    expect(result[1]).toBe('콜라');
    expect(result[2]).toBe('2');
  });

  test('숫자가 없을 때', () => {
    expect(() => ProductValidator.test.validateRegex('[콜라-]')).toThrow(
      '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    );
  });

  test('하이픈이 없을 때', () => {
    expect(() => ProductValidator.test.validateRegex('[콜라10]')).toThrow(
      '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    );
  });

  test('대괄호가 없을 때', () => {
    expect(() => ProductValidator.test.validateRegex('콜라-10')).toThrow(
      '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    );
  });

  test('수량이 0일 떄', () => {
    expect(() => ProductValidator.test.validateRegex('[콜라-0]')).toThrow(
      '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
    );
  });

  test('상품이 재고에 있을 때', () => {
    expect(() =>
      ProductValidator.test.checkNameExists(mockParseData, '콜라'),
    ).not.toThrow();
  });

  test('상품이 재고에 없을 떄', () => {
    expect(() =>
      ProductValidator.test.checkNameExists(mockParseData, '사과'),
    ).toThrow('[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.');
  });

  test('재고가 있을 때', () => {
    expect(() =>
      ProductValidator.test.checkQuantityExceeds(mockParseData, '콜라', 5),
    ).not.toThrow();
  });

  test('재고를 초과할 때', () => {
    expect(() =>
      ProductValidator.test.checkQuantityExceeds(mockParseData, '에너지바', 11),
    ).toThrow(
      '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
    );
  });
});
