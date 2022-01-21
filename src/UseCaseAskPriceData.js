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
import {consensus} from "@polkadot/types/interfaces/definitions";


function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();

  const [aresOraclePurchasedAvgTrace, setAresOraclePurchasedAvgTrace] = useState([]);
  const [aresOraclePurchasedAvgPrice, setAresOraclePurchasedAvgPrice] = useState([]);


  // aresOracle.purchasedAvgTrace
  // 获取购买均价记录
  async function loadAresOraclePurchasedAvgTrace (setStatus) {
    const exposures = await api.query.aresOracle.purchasedAvgTrace.entries();

    let finalResult = [];
    exposures.forEach(([key, exposure]) => {
      const tmp = key.args.map((k) => k.toHuman());
      const tmpBn = exposure.toHuman();
      finalResult.push({purchased_id: tmp[0], create_bn: tmpBn});
    });
    setStatus(finalResult);
  }

  // aresOracle.purchasedAvgPrice
  // 聚合的均价结果
  async function loadAresOraclePurchasedAvgPrice (setStatus) {
    const exposures = await api.query.aresOracle.purchasedAvgPrice.entries();
    let finalResult = [];
    exposures.forEach(([key, exposure]) => {
      const tmp = key.args.map((k) => k.toHuman());
      const tmpBn = exposure.toHuman();
      // finalResult.push({purchased_id: tmpBn, create_bn: tmpBn});
      let oldTmpData = finalResult[tmpBn[0]] ? finalResult[tmpBn[0]] : [];
      // oldTmpData.push({price_key: tmpBn[1]});
      // finalResult.append(tmpBn[0], oldTmpData);
      console.log(" tmp[0] =  ", tmp[0]);
      // finalResult[tmp[0]] = oldTmpData;
      finalResult.push({price_key: tmpBn[0]});
    });
    console.log("finalResult = ", finalResult, finalResult.length);
    setStatus(finalResult);
  }

  function getPurchasedAvgPrice(purchaseId) {
    if(aresOraclePurchasedAvgPrice[purchaseId]){
      return aresOraclePurchasedAvgPrice[purchaseId].price_key
    }
    return '-';
  }

  useEffect(async () => {
    loadAresOraclePurchasedAvgTrace(setAresOraclePurchasedAvgTrace);
    loadAresOraclePurchasedAvgPrice(setAresOraclePurchasedAvgPrice);
  }, []);

  return (
        <Grid.Column width={16}>
            <h2>付费询价数据请求.</h2>
            <Table celled striped size='small'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>成功购买ID</Table.Cell>
                  <Table.Cell>聚合区块</Table.Cell>
                  <Table.Cell>INFO</Table.Cell>
                </Table.Row>
                {aresOraclePurchasedAvgTrace.map(data => <Table.Row key={data.purchased_id}>
                  <Table.Cell>{data.purchased_id}</Table.Cell>
                  <Table.Cell>{data.create_bn}</Table.Cell>
                  <Table.Cell>{getPurchasedAvgPrice(data.purchased_id)}</Table.Cell>
                </Table.Row>)}
              </Table.Body>
            </Table>
        </Grid.Column>
  );
}

export default function UseCaseAskPriceData (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
