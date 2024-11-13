import { Console, MissionUtils } from '@woowacourse/mission-utils';
import YNValidator from './YesNoValidator.js';

class YesNoHandler {
  static async getYesOrNoInput(answer) {
    try {
      const input = (await MissionUtils.Console.readLineAsync(answer)) || '';
      if (!YNValidator.isValidYesOrNo(input)) {
        throw new Error('[ERROR] Y나 N을 입력해주세요.');
      }
      return input;
    } catch (error) {
      Console.print(error.message);
      return this.getYesOrNoInput(answer);
    }
  }
}

export default YesNoHandler;
