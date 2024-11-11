import { Console, DateTimes } from '@woowacourse/mission-utils';
import ProductParser from '../parsers/ProductParser.js';
import PromotionParser from '../parsers/PromotionParser.js';
import PromotionInput from '../view/PromotionInput.js';
import MembershipInput from '../view/MembershipInput.js';
import ProductValidator from '../utils/ProductValidator.js';

class PromotionService {
  constructor() {
    this.promotionProducts = [];
    this.promotions = [];
    this.cart = [];
    this.freeItems = [];
    this.totalPrice = 0;
    this.promotionDiscount = 0;
    this.membershipDiscount = 0;
    this.isMembershipApplied = false;
  }

  async loadProducts() {
    this.promotionProducts = await ProductParser.getParsedData();
  }

  async loadPromotions() {
    this.promotions = await PromotionParser.getParsedData();
  }

  async validatePromotion(input) {
    await this.loadProducts();
    await this.loadPromotions();

    let unpromotedQuantity = 0;

    await input.reduce(async (prevPromise, inputProduct) => {
      await prevPromise;

      const promotionProduct = this.promotionProducts.find(
        (product) =>
          product.name === inputProduct.name && product.promotion !== 'null',
      );
      const nonPromotionProduct = this.promotionProducts.find(
        (product) =>
          product.name === inputProduct.name && product.promotion === 'null',
      );

      const price = promotionProduct
        ? promotionProduct.price
        : nonPromotionProduct.price;

      if (promotionProduct) {
        const promotionName = promotionProduct.promotion;
        const promotionDetails = this.isPromotionProduct(promotionName);
        let promotionStock = promotionProduct.quantity;
        let quantityToCharge = inputProduct.quantity;

        if (promotionDetails) {
          if (this.isPromotionPeriod(promotionDetails)) {
            const buyAndGet = promotionDetails.buy + 1;

            while (
              quantityToCharge >= buyAndGet &&
              promotionStock >= buyAndGet
            ) {
              quantityToCharge -= buyAndGet;
              promotionStock -= buyAndGet;

              ProductParser.updateProductQuantity(inputProduct.name, buyAndGet);
              this.addToCart(inputProduct.name, promotionDetails.buy, price);
              this.addFreeItem(inputProduct.name);
            }

            unpromotedQuantity = quantityToCharge;

            if (unpromotedQuantity === promotionDetails.buy) {
              const addExtra = await PromotionInput.promptAdditionalQuantity(
                inputProduct.name,
              );

              if (addExtra === 'Y') {
                promotionStock -= unpromotedQuantity + 1;
                await ProductParser.updateProductQuantity(
                  inputProduct.name,
                  unpromotedQuantity + 1,
                );
                this.addToCart(inputProduct.name, promotionDetails.buy, price);
                this.addFreeItem(inputProduct.name);
                unpromotedQuantity = 0;
              }
            }
          } else {
            const generalStockProduct = this.promotionProducts.find(
              (product) =>
                product.name === inputProduct.name &&
                product.promotion === 'null',
            );

            if (
              !generalStockProduct ||
              generalStockProduct.quantity < quantityToCharge
            ) {
              throw new Error(
                `[ERROR] ${inputProduct.name}의 일반 재고가 부족합니다.`,
              );
            }

            generalStockProduct.quantity -= quantityToCharge;
            await ProductParser.updateNonPromotionQuantity(
              inputProduct.name,
              quantityToCharge,
            );
            this.addToCart(inputProduct.name, quantityToCharge, price);
            unpromotedQuantity = 0;
          }
        }

        if (unpromotedQuantity > 0) {
          const response =
            await PromotionInput.promptFullPriceForInsufficientPromotion(
              inputProduct.name,
              unpromotedQuantity,
            );

          if (response === 'Y') {
            this.addToCart(inputProduct.name, unpromotedQuantity, price);
          }
        }
      } else if (nonPromotionProduct) {
        if (nonPromotionProduct.quantity >= inputProduct.quantity) {
          await ProductParser.updateNonPromotionQuantity(
            inputProduct.name,
            inputProduct.quantity,
          );
          this.addToCart(
            inputProduct.name,
            inputProduct.quantity,
            nonPromotionProduct.price,
          );
        }
      }
    }, Promise.resolve());

    Console.print('');
    const applyMembership = await MembershipInput.getMembership();
    this.isMembershipApplied = applyMembership === 'Y';

    this.calculateDiscounts();
    this.displayReceipt();
  }

  displayReceipt() {
    Console.print('');
    Console.print('==============W 편의점================');
    Console.print('상품명\t\t수량\t금액');

    let totalQuantity = 0;
    let totalCostWithFreeItems = 0;

    this.cart.forEach(({ name, quantity, price }) => {
      const freeQuantity =
        this.freeItems.find((item) => item.name === name)?.quantity || 0;
      const displayQuantity = quantity + freeQuantity;
      totalQuantity += displayQuantity;
      const totalCost = displayQuantity * price;
      totalCostWithFreeItems += totalCost;

      Console.print(
        `${name}\t\t${displayQuantity}\t${totalCost.toLocaleString()}`,
      );
    });

    Console.print('=============증\t정=============');
    this.freeItems.forEach(({ name, quantity }) => {
      Console.print(`${name}\t\t${quantity}`);
    });

    Console.print('====================================');
    Console.print(
      `총구매액\t\t${totalQuantity}\t${totalCostWithFreeItems.toLocaleString()}`,
    );
    Console.print(`행사할인\t\t\t-${this.promotionDiscount.toLocaleString()}`);

    if (this.isMembershipApplied) {
      Console.print(
        `멤버십할인\t\t\t-${this.membershipDiscount.toLocaleString()}`,
      );
    }

    const finalAmount =
      totalCostWithFreeItems - this.promotionDiscount - this.membershipDiscount;
    Console.print(`내실돈\t\t\t ${finalAmount.toLocaleString()}\n`);
  }

  calculateDiscounts() {
    this.promotionDiscount = this.freeItems.reduce(
      (acc, item) =>
        acc +
        item.quantity *
          this.cart.find((cartItem) => cartItem.name === item.name).price,
      0,
    );

    const nonPromotionTotal = this.cart.reduce(
      (acc, { name, quantity, price }) => {
        const isPromotional = this.promotions.some(
          (promotion) =>
            promotion.name ===
            this.promotionProducts.find((product) => product.name === name)
              ?.promotion,
        );
        return isPromotional ? acc : acc + quantity * price;
      },
      0,
    );

    if (this.isMembershipApplied) {
      this.membershipDiscount = Math.floor(nonPromotionTotal * 0.3);
    }
  }

  addToCart(name, quantity, price) {
    const existingCartItem = this.cart.find((item) => item.name === name);
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      this.cart.push({ name, quantity, price });
    }
    this.totalPrice += quantity * price;
  }

  addFreeItem(name) {
    const freeItem = this.freeItems.find((item) => item.name === name);
    if (freeItem) {
      freeItem.quantity += 1;
    } else {
      this.freeItems.push({ name, quantity: 1 });
    }
  }

  isPromotionProduct(promotionName) {
    return this.promotions.find(
      (promotion) => promotion.name === promotionName,
    );
  }

  isPromotionPeriod(promotionDetails) {
    const currentDate = DateTimes.now();
    const startDate = new Date(promotionDetails.start_date);
    const endDate = new Date(promotionDetails.end_date);

    return currentDate >= startDate && currentDate <= endDate;
  }
}

export default PromotionService;
