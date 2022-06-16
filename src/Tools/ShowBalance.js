import React, { useEffect, useState } from 'react';
import { useSubstrate } from '../substrate-lib';
import utils from "../substrate-lib/utils"

function Main (props) {
  const { balance } = props;

  useEffect(() => {
    console.log('balance = ', balance)
  }, []);

  function convertBalance(amount) {
    return utils.convertBalanceToFloat(amount)
    // const integer_num =  (BigInt(amount) / BigInt(10**12)).toString()
    // const decimal_num =  (BigInt(amount) % BigInt(10**12)).toString().substr(0,2)
    // return `${integer_num}.${decimal_num}`
  }

  return (
      <span>{convertBalance(balance)} $ARES</span>
  );
}

export default function ShowBalance (props) {
  const { api } = useSubstrate();
  const { balance } = props;
  return api && balance ? <Main {...props} /> : null;
}
