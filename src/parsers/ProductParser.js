import fs from 'fs/promises'; // Use the promises version of fs
import path from 'path';

class ProductParser {
  constructor(filePath = 'public/products.md') {
    this.filePath = path.join(process.cwd(), filePath);
  }

  async getParsedData() {
    const data = await this.#loadProductData();
    this.promotionProducts = this.#parseData(data);
    return this.promotionProducts;
  }

  async #loadProductData() {
    // Directly read the file without needing a callback
    const data = await fs.readFile(this.filePath, 'utf-8');
    return data;
  }

  #parseData(data) {
    const lines = data.trim().split('\n');
    const [header, ...rows] = lines;
    const headers = header.split(',');
    return rows.map((row) => {
      const item = this.#createItem(headers, row.split(','));
      return this.#convertTypes(item);
    });
  }

  #createItem(headers, values) {
    const item = {};
    headers.forEach((head, index) => {
      item[head.trim()] = values[index].trim();
    });
    return item;
  }

  #convertTypes(item) {
    const newItem = { ...item };
    if ('price' in newItem) newItem.price = parseInt(newItem.price, 10);
    if ('quantity' in newItem)
      newItem.quantity = parseInt(newItem.quantity, 10);
    return newItem;
  }

  async updateProductQuantity(productName, quantityToDeduct) {
    const product = this.promotionProducts.find(
      (item) => item.name === productName,
    );

    if (product) {
      product.quantity -= quantityToDeduct;
      await this.saveDataToFile(this.promotionProducts);
    }
  }

  async updateNonPromotionQuantity(productName, quantityToDeduct) {
    const nonPromotionProduct = this.promotionProducts.find(
      (item) => item.name === productName && item.promotion === 'null',
    );

    if (nonPromotionProduct) {
      nonPromotionProduct.quantity -= quantityToDeduct;
      await this.saveDataToFile(this.promotionProducts);
    }
  }

  async saveDataToFile(data) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(
      (item) => `${item.name},${item.price},${item.quantity},${item.promotion}`,
    );
    const content = [headers, ...rows].join('\n');

    // Save file with await, no callback needed
    await fs.writeFile(this.filePath, content, 'utf-8');
  }
}

export default new ProductParser();
