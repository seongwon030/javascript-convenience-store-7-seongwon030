class ProductValidator {
  static async validateProduct(product, parseData = null) {
    const extractedProduct = product.split(',');
    const data =
      parseData ||
      (await (
        await import('../parsers/ProductParser.js')
      ).default.getParsedData());

    const validatedProducts = extractedProduct.map((prod) => {
      const match = this.#validateRegex(prod);
      this.#checkNameExists(data, match[1]);
      this.#checkQuantityExceeds(data, match[1], parseInt(match[2], 10));
      return { name: match[1], quantity: parseInt(match[2], 10) };
    });
    return validatedProducts;
  }

  static #validateRegex(product) {
    const match = product.match(/^\[([가-힣]+)-(\d+)\]$/);
    if (!match) {
      throw new Error(
        '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
      );
    }
    if (parseInt(match[2], 10) === 0) {
      throw new Error('[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.');
    }
    return match;
  }

  static #checkNameExists(data, productName) {
    const nameExists = data.some((item) => item.name === productName);
    if (!nameExists) {
      throw new Error('[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.');
    }
  }

  static #checkQuantityExceeds(data, productName, inputQuantity) {
    const productData = data.find((item) => item.name === productName);
    if (
      productData &&
      productData.promotion === 'null' &&
      inputQuantity > productData.quantity
    ) {
      throw new Error(
        '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
      );
    }
  }

  static test =
    process.env.NODE_ENV === 'test'
      ? {
          validateRegex: ProductValidator.#validateRegex,
          checkNameExists: ProductValidator.#checkNameExists,
          checkQuantityExceeds: ProductValidator.#checkQuantityExceeds,
        }
      : null;
}

export default ProductValidator;
