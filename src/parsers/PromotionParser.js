import fs from 'fs/promises'; // Make sure this is fs/promises and not fs
import path from 'path';

class PromotionParser {
  constructor(filePath = 'public/promotions.md') {
    this.filePath = path.join(process.cwd(), filePath);
  }

  async getParsedData() {
    const data = await this.#loadProductData();
    return this.#parseData(data);
  }

  async #loadProductData() {
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

  #convertTypes(item) {
    const newItem = { ...item };
    if ('buy' in newItem) newItem.buy = parseInt(newItem.buy, 10);
    if ('get' in newItem) newItem.get = parseInt(newItem.get, 10);
    return newItem;
  }

  #createItem(headers, values) {
    const item = {};
    headers.forEach((head, index) => {
      item[head.trim()] = values[index].trim();
    });
    return item;
  }
}

export default new PromotionParser();
