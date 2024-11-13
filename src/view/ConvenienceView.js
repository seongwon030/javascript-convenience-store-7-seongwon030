import { Console } from '@woowacourse/mission-utils';
import ProductParser from '../parsers/ProductParser.js';

class ConvenienceView {
  async displayProducts() {
    this.hello();
    const products = await this.loadProducts();
    this.displayProductList(products);
    Console.print('');
  }

  async loadProducts() {
    const data = await ProductParser.getParsedData();
    return data;
  }

  async hello() {
    Console.print('안녕하세요. W편의점입니다.');
    Console.print('현재 보유하고 있는 상품입니다.');
    Console.print('');
  }

  displayProductList(products) {
    const groupedProducts = products.reduce((acc, product) => {
      if (!acc[product.name]) acc[product.name] = [];
      acc[product.name].push(product);
      return acc;
    }, {});

    Object.values(groupedProducts).forEach((productVariants) => {
      let hasGeneralStock = false;

      productVariants.forEach((product) => {
        const { name, price, quantity, promotion } = product;
        const promotionText = promotion !== 'null' ? promotion : '';
        const stockText = quantity > 0 ? `${quantity}개` : '재고 없음';

        Console.print(
          `- ${name} ${price.toLocaleString()}원 ${stockText} ${promotionText}`,
        );

        // 일반 재고가 있는지 확인
        if (promotion === 'null' && quantity > 0) {
          hasGeneralStock = true;
        }
      });

      // 일반 재고가 없는 경우 "재고 없음" 출력
      const promotionOnly = productVariants.some(
        (product) => product.promotion !== 'null' && product.quantity > 0,
      );
      if (promotionOnly && !hasGeneralStock) {
        const { name, price } = productVariants[0];
        Console.print(`- ${name} ${price.toLocaleString()}원 재고 없음`);
      }
    });
  }
}

export default ConvenienceView;
