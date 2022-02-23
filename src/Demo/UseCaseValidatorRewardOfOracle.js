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

  async function getSumRewardBalance() {
    const TOTAL_PURCHASE_REWARD_TOKEN = gql`
      query{
        totalPurchaseRewardToken(id: "TotalPurchaseRewardToken") {
          reward
        }
      }
    `;
    // const { loading, error, data } = useQuery(TOTAL_PURCHASE_REWARD_TOKEN);
    const result = await apollo_client.query({query: TOTAL_PURCHASE_REWARD_TOKEN});
    console.log("useQuery data: ", result.data.totalPurchaseRewardToken?result.data.totalPurchaseRewardToken.reward:0);
    setTotalPurchaseRewardToken(result.data.totalPurchaseRewardToken?result.data.totalPurchaseRewardToken.reward:0);
  }

  //
  async function calculateBalancePerPoint () {
    console.log("RUN calculateBalancePerPoint");

    askEraPoint.forEach((value, eraNum)=>{
      balancePerPoint.set(eraNum, askEraPayment.get(eraNum) / BigInt(value));
    });
    console.log("balancePerPoint ==> ", balancePerPoint);
    await setBalancePerPoint(balancePerPoint);
  }

  async function calculateAccountRewardList () {

    console.log("askEraPoint == ", askEraPoint);
    console.log("askEraPayment == ", askEraPayment);
    console.log("balancePerPoint == ", balancePerPoint);
    console.log("askEraPointInfo == ", askEraPointInfo)

    askEraPointInfo.map(data => {
      const validatorAcc = data.validatorAcc;
      const eraNum = data.eraNum;
      const purchaseId = data.purchaseId;
      const point = data.point;

      if(!rewardTraceList.has(`${validatorAcc}-${eraNum}`)) {
        if (!unclaimedRewards.has(validatorAcc)) {
          const eraList = [];
          eraList.push(eraNum);
          unclaimedRewards.set(validatorAcc, {
            eraList,
            point,
            preIncome: balancePerPoint.get(eraNum) * BigInt(point)
          });
        } else {
          const data = unclaimedRewards.get(validatorAcc);
          // let newEraList = data.eraList.push(eraNum)
          if(!data.eraList.includes(eraNum)){
            data.eraList.push(eraNum);
          }
          data.point += point;
          data.preIncome += balancePerPoint.get(eraNum) * BigInt(point);
          unclaimedRewards.set(validatorAcc, data);
        }
      }
    });

    setUnclaimedRewards(unclaimedRewards);
    // Extract account-led lists.
    const tmpRewardList = [];
    // rewardTraceList.
    unclaimedRewards.forEach((rewardData, acc) => {
      tmpRewardList.push({
        acc,
        eraNum: rewardData.eraList.toString(),
        point: rewardData.point,
        preIncome: rewardData.preIncome
      });
    });

    console.log("rewardData = ,", tmpRewardList);
    setAccountRewardList(tmpRewardList);
  }

  // oracleFinance.askEraPayment
  async function loadAskEraPayment () {
    if (!api.query.oracleFinance.askEraPayment){
      return;
    }
    const exposures = await api.query.oracleFinance.askEraPayment.entries();

    exposures.forEach(([key, value]) => {
      const tmp = key.args.map((k) => k.toHuman());
      const eraNum = tmp[0];
      const payment_balance = value.toBigInt();
      if (!askEraPayment.has(eraNum)) {
        askEraPayment.set(eraNum, payment_balance);
      }else{
        const payment = askEraPayment.get(eraNum) + payment_balance;
        askEraPayment.set(eraNum, payment);
      }
    });
    console.log('askEraPayment', askEraPayment);
    await setAskEraPayment(askEraPayment);
  }

  // Reward trace.
  async function loadRewardTrace () {
    const exposures = await api.query.oracleFinance.rewardTrace.entries();
    console.log('reward_trace', exposures);
    exposures.forEach(([key, value]) => {
      const tmp = key.args.map((k) => k.toHuman());
      const eraNum = tmp[0];
      const validatorAcc = tmp[1];
      const mapKey = `${validatorAcc}-${eraNum}`;
      if (!rewardTraceList.has(mapKey)) {
        rewardTraceList.set(mapKey, true);
      }
    });
    await setRewardTraceList(rewardTraceList);
  }



  // Read ask era points
  async function loadAresOracleAskEraPoint () {
    if(!api.query.oracleFinance.askEraPoint){
      return true;
    }
    const exposures = await api.query.oracleFinance.askEraPoint.entries();
    console.log('era_point_list', exposures);
    const validatorList = [];
    exposures.forEach(([key, value]) => {
      const tmp = key.args.map((k) => k.toHuman());
      const eraNum = tmp[0];
      const validatorAcc = tmp[1][0];
      const purchaseId = tmp[1][1];
      const point = parseInt(value.toString());

      if(!askEraPoint.has(eraNum)){
        askEraPoint.set(eraNum, point);
      }else{
        askEraPoint.set(eraNum, point + askEraPoint.get(eraNum));
      }

      askEraPointInfo.push({
        eraNum,
        validatorAcc,
        purchaseId,
        point
      });

    });

    setAskEraPoint(askEraPoint);
    setAskEraPointInfo(askEraPointInfo);
  }

  useEffect(async () => {

    await loadAskEraPayment();
    await loadRewardTrace();
    await loadAresOracleAskEraPoint();
    await calculateBalancePerPoint();
    await calculateAccountRewardList();
    getSumRewardBalance();

  }, [setUnclaimedRewards, setAccountRewardList, setAskEraPoint, setAskEraPayment, setBalancePerPoint, setAskEraPointInfo]);

  return (
        <Grid.Column width={16}>
            <h2>已发放的奖励</h2>
            <div>{totalPurchaseRewardToken}</div>
            <h2>未领取的奖励</h2>
            <Table celled striped size='small'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>验证人</Table.Cell>
                  <Table.Cell>时区</Table.Cell>
                  <Table.Cell>点数</Table.Cell>
                  <Table.Cell>奖励预估</Table.Cell>
                  <Table.Cell>领取</Table.Cell>
                </Table.Row>
                {accountRewardList.map(data=><Table.Row key={`${data.acc}-${data.eraNum}`}>
                  <Table.Cell>{data.acc}</Table.Cell>
                  <Table.Cell>{data.eraNum}</Table.Cell>
                  <Table.Cell>{data.point}</Table.Cell>
                  <Table.Cell>{data.preIncome.toString()}</Table.Cell>
                  <Table.Cell>领取</Table.Cell>
                </Table.Row>)}
              </Table.Body>
            </Table>
        </Grid.Column>
  );
}

export default function UseCaseValidatorRewardOfOracle (props) {
  const { api } = useSubstrate();
  return api.query.session && api.query.oracleFinance ? <Main {...props} /> : null;
}
