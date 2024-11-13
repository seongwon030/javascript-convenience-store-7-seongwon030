import YesNoHandler from '../utils/YesNoHandler.js';

class MembershipInput {
  static async getMembership() {
    const message = await YesNoHandler.getYesOrNoInput(
      '멤버십 할인을 받으시겠습니까? (Y/N)\n',
    );
    return message;
  }
}

export default MembershipInput;
