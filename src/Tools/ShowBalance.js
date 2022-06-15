import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Grid,
  Card,
  Statistic,
  GridRow,
  Label,
  Icon,
  Dropdown,
  Button,
  Table,
  Container,
  Rating, Tab
} from 'semantic-ui-react';

import { gql, useQuery, getApolloContext } from "@apollo/client";
import { useSubstrate } from '../substrate-lib';
// import {useAresContext} from "../substrate-lib/AresContext";

import {
  Link,
  useParams
} from "react-router-dom";

function Main (props) {
  const { balance } = props;

  useEffect(() => {
    console.log('balance = ', balance)
  }, []);

  function convertBalance(amount) {
    const integer_num =  (BigInt(amount) / BigInt(10**12)).toString()
    const decimal_num =  (BigInt(amount) % BigInt(10**12)).toString().substr(0,2)
    return `${integer_num}.${decimal_num}`
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
