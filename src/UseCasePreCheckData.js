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
  const { accountPair, apollo_client } = props;

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();

  const [preCheckTaskList, setPreCheckTaskList] = useState([]);

  const [refreshData, setRefreshData] = useState(0);
  const [preCheckTasks, setPreCheckTasks] = useState([]);
  const [preCheckResults, setPreCheckResults] = useState(new Map);

  const client = new ApolloClient({
    uri: 'http://localhost:3001',
    cache: new InMemoryCache()
  });

  async function loadPreCheckTasks() {
    const PRE_CHECK_RESULT = gql`
      query{
        newPreCheckTasks(last: 5000) {
          nodes {
            id,
            stashAccount,
            aresAccount,
            eventBn,
            createBn,
            checkResult {
              resultStatus
            }
          }
        }
      }
    `;
    const result = await apollo_client.query({query: PRE_CHECK_RESULT});
    console.log("new result.data = ", result.data.newPreCheckTasks.nodes);
    await setPreCheckTaskList(result.data.newPreCheckTasks.nodes);
  }
  //
  // async function loadPreCheckResults(stash_id) {
  //
  //   if (preCheckResults.has(stash_id)) {
  //     return preCheckResults.get(stash_id);
  //   }
  //   const result = await client.query({
  //     query: gql`
  //       query{
  //         newPreCheckResults(last:5000, filter: {
  //           stashAccount: {
  //             equalTo: "${stash_id}"
  //           }
  //         }){
  //           nodes {
  //             id,
  //             createBn,
  //             eventBn,
  //             workData
  //           }
  //         }
  //       }
  //     `
  //   });
  //   preCheckResults.set(stash_id, result.data.newPreCheckResults.nodes);
  //   await setPreCheckResults(preCheckResults);
  // }
  //
  // async function loadPreCheckTaskList () {
  //   const authorities = await api.query.aresOracle.preCheckTaskList();
  //   console.log("Pre authorities = ", authorities.toHuman());
  //   await setPreCheckTaskList(authorities);
  // }

  useEffect(async () => {
    console.log("------ useEffect ");
    await loadPreCheckTasks();
  }, [setPreCheckTaskList]);

  return (
        <Grid.Column width={16}>
            <h2>Validator Audit. {refreshData}</h2>
            <Table celled striped size='small'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell width={2}>Validator id 2</Table.Cell>
                  <Table.Cell width={2}>Ares-Authority</Table.Cell>
                  <Table.Cell width={2}>Event block</Table.Cell>
                  <Table.Cell width={2}>Review results</Table.Cell>
                </Table.Row>
                {preCheckTaskList.map(data => <Table.Row key={data.id}>
                  <Table.Cell>{data.stashAccount}</Table.Cell>
                  <Table.Cell>{data.aresAccount}</Table.Cell>
                  <Table.Cell>{data.eventBn}</Table.Cell>
                  <Table.Cell>{data.checkResult?data.checkResult.resultStatus:'Review'}</Table.Cell>
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
