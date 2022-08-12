import config from '../config';

const utils = {
  paramConversion: {
    num: [
      'Compact<Balance>',
      'BalanceOf',
      'u8', 'u16', 'u32', 'u64', 'u128',
      'i8', 'i16', 'i32', 'i64', 'i128'
    ]
  },
  convertBalanceToFloat(amount){
    const integer_num =  (BigInt(amount) / BigInt(10**config.TOKEN_PRECISION)).toString()
    const decimal_num =  (BigInt(amount) / BigInt(10**config.TOKEN_PRECISION)).toString().substr(0,2)
    return parseFloat(`${integer_num}.${decimal_num}`)
  }
};

export default utils;
