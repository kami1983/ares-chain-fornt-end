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
import {ApolloProvider} from "@apollo/client/react/context/ApolloProvider";

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair, apollo_client } = props;

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();

  const [unclaimedRewards, setUnclaimedRewards] = useState(new Map);
  const [accountRewardList, setAccountRewardList] = useState([]);
  const [rewardTraceList, setRewardTraceList] = useState(new Map);
  const [askEraPayment, setAskEraPayment] = useState(new Map);
  const [askEraPoint, setAskEraPoint] = useState(new Map);
  const [balancePerPoint, setBalancePerPoint] = useState(new Map);
  const [askEraPointInfo, setAskEraPointInfo] = useState([]);
  const [totalPurchaseRewardToken, setTotalPurchaseRewardToken] = useState(0);

  // async function getSumRewardBalance() {
  //   const TOTAL_PURCHASE_REWARD_TOKEN = gql`
  //     query{
  //       totalPurchaseRewardToken(id: "TotalPurchaseRewardToken") {
  //         reward
  //       }
  //     }
  //   `;
  //   // const { loading, error, data } = useQuery(TOTAL_PURCHASE_REWARD_TOKEN);
  //   const result = await apollo_client.query({query: TOTAL_PURCHASE_REWARD_TOKEN});
  //   console.log("useQuery data: ", result.data.totalPurchaseRewardToken.reward);
  //   setTotalPurchaseRewardToken(result.data.totalPurchaseRewardToken.reward);
  // }

  useEffect(async () => {

  }, []);

  return (
        <Grid.Column width={16}>
            <h2>付费询价数据查询</h2>
            <Table celled striped size='small'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>订单ID</Table.Cell>
                  <Table.Cell>询价人</Table.Cell>
                  <Table.Cell>申请区块</Table.Cell>
                  <Table.Cell>购买信息</Table.Cell>
                  <Table.Cell>预付费</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
        </Grid.Column>
  );
}

export default function UseCasePaidOrderList (props) {
  const { api } = useSubstrate();
  return api.query.session && api.query.oracleFinance ? <Main {...props} /> : null;
}
