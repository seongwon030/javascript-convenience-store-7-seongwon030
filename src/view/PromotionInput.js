import YesNoHandler from '../utils/YesNoHandler.js';

class PromotionInput {
  static async promptAdditionalQuantity(productName) {
    const message = await YesNoHandler.getYesOrNoInput(
      `\n현재 ${productName}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`,
    );
    return message;
  }

  static async promptFullPriceForInsufficientPromotion(productName, quantity) {
    const message = await YesNoHandler.getYesOrNoInput(
      `\n현재 ${productName} ${quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`,
    );
    return message;
  }
}

export default PromotionInput;
