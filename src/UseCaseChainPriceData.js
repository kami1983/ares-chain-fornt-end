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

import { useSubstrate } from './substrate-lib';


function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();

  const [aresOraclePricesRequests, setAresOraclePricesRequests] = useState([]);
  const [aresOracleAresAvgPrice, setAresOracleAresAvgPrice] = useState([]);
  const [aresOracleLastPriceAuthor, setAresOracleLastPriceAuthor] = useState([]);
  const [aresOraclejumpBlockNumber, setAresOraclejumpBlockNumber] = useState([]);



  // 读取报价请求Pair
  async function loadAresOraclePricesRequests (setStatus) {
    const priceRequestListRaw = await api.query.aresOracle.pricesRequests();
    let finalResult = [];
    priceRequestListRaw.map((dataArr)=>{
      // PriceKey,PriceToken,u32,FractionLength,RequestInterval
      let tmpData = {};
      tmpData.price_key = dataArr[0].toHuman();
      tmpData.price_token = dataArr[1].toHuman();
      tmpData.price_version = dataArr[2].toHuman();
      tmpData.fraction_length = dataArr[3].toHuman();
      tmpData.request_interval = dataArr[4].toHuman();
      finalResult.push(tmpData);
    });
    setStatus(finalResult);
  }

  // 加载链上报价结果数据（平均值）
  async function loadAresOracleAresAvgPrice (setStatus) {
    const exposures = await api.query.aresOracle.aresAvgPrice.entries();
    const finalResult = [];
    exposures.forEach(([key, exposure]) => {
      const tmp = key.args.map((k) => k.toHuman());
      const tmpPrice = exposure.toHuman();
      finalResult[tmp[0]]= {integer: tmpPrice[0], fraction_length: tmpPrice[1]} ;
    });
    setStatus(finalResult);
  }

  // 获取跳块号
  async function loadAresOraclejumpBlockNumber (setStatus) {
    const exposures = await api.query.aresOracle.jumpBlockNumber.entries();
    const finalResult = [];
    exposures.forEach(([key, exposure]) => {
      const tmp = key.args.map((k) => k.toHuman());
      const tmpPrice = exposure.toHuman();
      finalResult[tmp[0]]= tmpPrice ;
    });
    setStatus(finalResult);
  }

  // 读取最后报价人数据
  async function loadAresOracleLastPriceAuthor (setStatus) {
    const exposures = await api.query.aresOracle.lastPriceAuthor.entries();
    const finalResult = [];
    exposures.forEach(([key, exposure]) => {
      const tmp = key.args.map((k) => k.toHuman());
      const tmpPrice = exposure.toHuman();
      finalResult[tmp[0]]= tmpPrice ;
    });
    console.log("finalResult = ", finalResult);
    setStatus(finalResult);
  }

  // 获取链上的报价数据。
  function getPriceChainInfo(priceKey) {
    if(aresOracleAresAvgPrice[priceKey]){
      return aresOracleAresAvgPrice[priceKey];
    }
    return {integer: 0, fraction_length: 0};
  }

  useEffect(async () => {
    loadAresOraclePricesRequests(setAresOraclePricesRequests);
    loadAresOracleAresAvgPrice(setAresOracleAresAvgPrice);
    loadAresOracleLastPriceAuthor(setAresOracleLastPriceAuthor);
    loadAresOraclejumpBlockNumber(setAresOraclejumpBlockNumber);
  }, []);

  return (
        <Grid.Column width={16}>
            <h2>On-chain price data.</h2>
            <Table celled striped size='small'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>PriceKey</Table.Cell>
                  <Table.Cell>PriceToken</Table.Cell>
                  <Table.Cell>Request interval (block)</Table.Cell>
                  <Table.Cell>Pre accuracy</Table.Cell>
                  <Table.Cell>Price integer</Table.Cell>
                  <Table.Cell>Actual accuracy</Table.Cell>
                  <Table.Cell>Last bidder</Table.Cell>
                  <Table.Cell>Jump BN</Table.Cell>
                </Table.Row>
                {aresOraclePricesRequests.map(data=><Table.Row key={data.price_key}>
                  <Table.Cell>{data.price_key}</Table.Cell>
                  <Table.Cell>{data.price_token}</Table.Cell>
                  <Table.Cell>{data.request_interval}</Table.Cell>
                  <Table.Cell>{data.fraction_length}</Table.Cell>
                  <Table.Cell>{getPriceChainInfo(data.price_key).integer}</Table.Cell>
                  <Table.Cell>{getPriceChainInfo(data.price_key).fraction_length}</Table.Cell>
                  <Table.Cell>{aresOracleLastPriceAuthor[data.price_key]}</Table.Cell>
                  <Table.Cell>{aresOraclejumpBlockNumber[data.price_key]}</Table.Cell>
                </Table.Row>)}
              </Table.Body>
            </Table>
        </Grid.Column>
  );
}

export default function UseCaseChainPriceData (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
