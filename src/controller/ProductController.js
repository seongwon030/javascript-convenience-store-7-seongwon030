import { Console } from '@woowacourse/mission-utils';
import ProductInput from '../view/ProductInput.js';
import ProductValidator from '../utils/ProductValidator.js';

class ProductController {
  constructor() {
    this.inputHandler = new ProductInput();
  }

  async getValidatedInput() {
    try {
      const input = await this.inputHandler.readItem();
      return await ProductValidator.validateProduct(input);
    } catch (error) {
      Console.print(error.message);
      return this.getValidatedInput();
    }
  }
}

export default ProductController;
