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

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";



function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();

  const [aresOraclePurchasedAvgTrace, setAresOraclePurchasedAvgTrace] = useState([]);
  const [aresOraclePurchasedAvgPrice, setAresOraclePurchasedAvgPrice] = useState(new Map);
  const [purchasedEvent, setPurchasedEvent] = useState(new Map);
  const [purchasedEvents, setPurchasedEvents] = useState([]);

  const client = new ApolloClient({
    uri: 'http://localhost:3001',
    cache: new InMemoryCache()
  });

  // 获取购买人信息，该信息通过Subquery进行查询。
  async function loadNewPurchasedRequestEventBySQ(purchase_id) {
    client.query({
      query: gql`
        query{
          newPurchasedRequestEvent(id: "${purchase_id}"){
            id,
            prepayments,
            accountId
          }
        }
      `
    }).then(result => {
      purchasedEvent.set(purchase_id, result.data.newPurchasedRequestEvent);
      setPurchasedEvent(purchasedEvent);
    });
  }

  async function loadNewPurchasedRequestEvents() {
    client.query({
      query: gql`
        query{
          newPurchasedRequestEvents{
            nodes{
              id,
              accountId,
              createBn,
              prepayments,
              submitThreshold,
              requestKeys,
              avg_result{
                nodes{
                  resultList
                }
              },
              pay_for_result{
                nodes{
                  fee
                }
              },
              insufficient_count_result{
                nodes{
                  purchasedId
                }
              }
            }
          }
        }
      `
    }).then(result => {
      console.log("result.data.newPurchasedRequestEvents.nodes = ", result.data.newPurchasedRequestEvents.nodes);
      setPurchasedEvents(result.data.newPurchasedRequestEvents.nodes);
    });
  }

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
    let finalResult = new Map();
    exposures.forEach(([key, exposure]) => {
      const keys = key.args.map((k) => k.toHuman());
      const values = exposure.toHuman();
      const saveValue = {
        price_key: keys[1],
        create_bn: values.create_bn,
        price_data: values.price_data,
        reached_type: values.reached_type
      };
      let saveValueList = finalResult.has(keys[0]) ? finalResult.get(keys[0]) : [];
      saveValueList.push(saveValue);
      finalResult.set(keys[0], saveValueList);
      loadNewPurchasedRequestEventBySQ(keys[0]);
    });
    setStatus(finalResult);
  }

  function getPurchasedAvgPrice(purchaseId) {
    if(aresOraclePurchasedAvgPrice.has(purchaseId)){
      return aresOraclePurchasedAvgPrice.get(purchaseId);
    }
    return [];
  }

  function getNewPurchasedEvent(purchaseId) {
    if(purchasedEvent.has(purchaseId)){
      const result = purchasedEvent.get(purchaseId);
      console.log(` debug - getNewPurchasedEvent = `, result)
      return purchasedEvent.get(purchaseId);
    }
    return null;
  }

  useEffect(async () => {

    // loadAresOraclePurchasedAvgTrace(setAresOraclePurchasedAvgTrace);
    // loadAresOraclePurchasedAvgPrice(setAresOraclePurchasedAvgPrice);
    loadNewPurchasedRequestEvents();
    console.log("RUN -- 2");
  }, []);

  return (
        <Grid.Column width={16}>
            <h2>Paid order list</h2>
            <Table celled striped size='small'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell width={2}>Order id</Table.Cell>
                  <Table.Cell width={2}>Who</Table.Cell>
                  <Table.Cell width={2}>Apply block</Table.Cell>
                  <Table.Cell width={1}>Purchase quantity</Table.Cell>
                  <Table.Cell width={2}>Request pairs</Table.Cell>
                  <Table.Cell width={1}>Status</Table.Cell>
                  <Table.Cell width={1}>Prepaid</Table.Cell>
                  <Table.Cell width={1}>Final payment</Table.Cell>
                  <Table.Cell width={4}>Aggregated result</Table.Cell>
                </Table.Row>
                {purchasedEvents.map(data => <Table.Row key={data.id}>
                  <Table.Cell><Input value={data.id} /></Table.Cell>
                  <Table.Cell>
                    <Input value={data.accountId} />
                  </Table.Cell>
                  <Table.Cell>{data.createBn}</Table.Cell>
                  <Table.Cell>{data.requestKeys.length}</Table.Cell>
                  <Table.Cell>{data.requestKeys.toString()}</Table.Cell>
                  <Table.Cell>{
                    data.insufficient_count_result.nodes.length?'fail':
                        data.pay_for_result.nodes.length?'success':'pending'
                  }</Table.Cell>
                  <Table.Cell>{data.prepayments}</Table.Cell>
                  <Table.Cell>{data.pay_for_result.nodes.length?data.pay_for_result.nodes[0].fee:'Unpaid'}</Table.Cell>
                  <Table.Cell>{data.avg_result.nodes.length?data.avg_result.nodes[0].resultList.map(sub_data=><div>
                    {sub_data.price_key}#Count:[{sub_data.respondents.length}]#[{sub_data.reached_type == 1?'Full':'Part'}]#Block:{sub_data.create_bn}
                    <hr/>
                  </div>):"No response"}</Table.Cell>
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
