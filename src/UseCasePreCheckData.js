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
  const [refreshData, setRefreshData] = useState(0);
  const [preCheckTasks, setPreCheckTasks] = useState([]);
  const [preCheckResults, setPreCheckResults] = useState(new Map);

  const client = new ApolloClient({
    uri: 'http://localhost:3001',
    cache: new InMemoryCache()
  });

  async function loadPreCheckTasks() {
    let result = await client.query({
      query: gql`
        query{
          newPreCheckTasks(last:5000){
            nodes {
              id,
              stashAccount,
              aresAccount,
              eventBn,
              createBn
            }
          }
        }
      `
    });
    result.data.newPreCheckTasks.nodes.map(async data => {
      await loadPreCheckResults(data.stashAccount);
    });

    const newRefreshData = refreshData + 1;
    console.log("new newRefreshData = 2", newRefreshData);
    await setRefreshData(newRefreshData);
    await setPreCheckTasks(result.data.newPreCheckTasks.nodes);
  }

  async function loadPreCheckResults(stash_id) {

    if (preCheckResults.has(stash_id)) {
      return preCheckResults.get(stash_id);
    }
    const result = await client.query({
      query: gql`
        query{
          newPreCheckResults(last:5000, filter: {
            stashAccount: {
              equalTo: "${stash_id}"
            }
          }){
            nodes {
              id,
              createBn,
              eventBn,
              workData
            }
          }
        }
      `
    });
    preCheckResults.set(stash_id, result.data.newPreCheckResults.nodes);
    await setPreCheckResults(preCheckResults);
  }

  useEffect(async () => {
    if(preCheckTasks.length == 0 ) {
      await loadPreCheckTasks();
    }
    console.log(" **** Pre check data. ");
  }, [preCheckTasks, preCheckResults, refreshData]);

  return (
        <Grid.Column width={16}>
            <h2>Validator Audit. {refreshData}</h2>
            <Table celled striped size='small'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell width={2}>Validator id</Table.Cell>
                  <Table.Cell width={2}>Ares-Authority</Table.Cell>
                  <Table.Cell width={2}>Event block</Table.Cell>
                  <Table.Cell width={2}>Review results</Table.Cell>
                </Table.Row>
                {preCheckTasks.map(data => <Table.Row key={data.id}>
                  <Table.Cell>{data.stashAccount}</Table.Cell>
                  <Table.Cell>{data.aresAccount}</Table.Cell>
                  <Table.Cell>{data.eventBn}</Table.Cell>
                  <Table.Cell>{preCheckResults.has(data.stashAccount)?preCheckResults.get(data.stashAccount).map(sub_data=><div>
                    {sub_data.eventBn} [TODO]
                    <hr/>
                  </div>):"abnormal"}</Table.Cell>
                </Table.Row>)}
              </Table.Body>
            </Table>
        </Grid.Column>
  );
}

export default function UseCasePreCheckData (props) {
  const { api } = useSubstrate();
  return api.query ? <Main {...props} /> : null;
}
