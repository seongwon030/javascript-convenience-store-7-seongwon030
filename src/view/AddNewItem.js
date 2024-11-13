import YesNoHandler from '../utils/YesNoHandler.js';

class AddNewItem {
  static async getNewItem() {
    const message = await YesNoHandler.getYesOrNoInput(
      '감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n',
    );
    return message;
  }
}

export default AddNewItem;
