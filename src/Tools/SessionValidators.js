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

// const {apollo_client, hello} = useAresContext()
import {
  Link,
  useParams
} from "react-router-dom";
import LinkToSubstrate from "./LinkToSubstrate";
import ValidatorLables from "./ValidatorLables";
import LinkToAccount from "./LinkToAccount";
import ValidatorStakingReward from "./ValidatorStakingReward";

function Main (props) {
  const { api, hello, apollo_client } = useSubstrate();

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  const {session_id} = useParams();

  const [sessionObj, setSessionObj] = useState(null);

  async function getSessionValidators() {
    apollo_client.query({
      query: gql`
        query{
          sessionNewSessionEvents(orderBy:TIMESTAMP_DESC,filter:{
            sessionId:{equalTo:${session_id}}
          }){
            nodes{
              sessionId,
              timestamp,
              timestring,
              validatorCount,
              validatorSet,
              eventBn
            }
          }
        }
      `
    }).then(result => {

      let nodes = result.data.sessionNewSessionEvents.nodes[0]
      console.log("result.data. sessionNewSessionEvents = ", nodes)
      setSessionObj(nodes)
    });
  }

  useEffect(() => {
    getSessionValidators()
  }, []);

  return (
        <Grid.Column width={16}>
          <h2>Session Validators - Session id = {session_id}</h2>
          <div>
            <h4>Validator count: {sessionObj?.validatorCount}</h4>
            <h4>Date: {sessionObj?.timestring}</h4>
            <h4>Event bn: <LinkToSubstrate bn={sessionObj?.eventBn} /></h4>
          </div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Cell>sessionId</Table.Cell>
                <Table.Cell>标签</Table.Cell>
                <Table.Cell>已领取的ARES</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
            {sessionObj?.validatorSet.map(
                dataValidator => <Table.Row>
                  <Table.Cell><LinkToAccount acc={dataValidator} /></Table.Cell>
                  <Table.Cell><ValidatorLables acc={dataValidator}/></Table.Cell>
                  <Table.Cell><ValidatorStakingReward acc={dataValidator}/></Table.Cell>
                </Table.Row>
            )}
            </Table.Body>
          </Table>
        </Grid.Column>
  );
}

export default function SessionValidators (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
