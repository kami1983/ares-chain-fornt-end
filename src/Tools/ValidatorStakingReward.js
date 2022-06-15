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
import ShowBalance from "./ShowBalance";


function Main (props) {
  const { api, hello, apollo_client } = useSubstrate();
  const [accountInfo, setAccountInfo] = useState(null)

  const { acc } = props;

  async function getSessionValidators() {
    apollo_client.query({
      query: gql`
        query{
          aresAccount(id:"${acc}") {
            stakingTotalReward
          }
        }
      `
    }).then(result => {
      let accountInfo = result.data.aresAccount
      console.log("result.data. = ", accountInfo)
      setAccountInfo(accountInfo)
    });
  }

  useEffect(() => {
    getSessionValidators()
  }, []);

  return (
      <>
        <ShowBalance balance={accountInfo?accountInfo.stakingTotalReward:0} />
      </>
  );
}

export default function ValidatorStakingReward (props) {
  const { api, apollo_client } = useSubstrate();
  return api && apollo_client ? <Main {...props} /> : null;
}
