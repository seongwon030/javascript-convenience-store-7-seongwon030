import { Console } from '@woowacourse/mission-utils';
import ProductController from './controller/ProductController.js';
import PromotionService from './service/PromotionService.js';
import ConvenienceView from './view/ConvenienceView.js';
import AddNewItem from './view/AddNewItem.js';

class App {
  async run() {
    const convenience = new ConvenienceView();
    const controller = new ProductController();
    const promotionService = new PromotionService();

    try {
      await convenience.displayProducts();
      const input = await controller.getValidatedInput();

      await promotionService.validatePromotion(input);

      const addNewItemResponse = await AddNewItem.getNewItem();
      if (addNewItemResponse === 'Y') {
        Console.print('');
        await this.run();
      }
    } catch (error) {
      Console.print(error.message);
    }
  }
}

export default App;
