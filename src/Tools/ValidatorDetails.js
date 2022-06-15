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
import LinkToSubstrate from "./LinkToSubstrate";
import LinkToAccount from "./LinkToAccount";
import ValidatorLables from "./ValidatorLables";


import {
  Link,
  useParams
} from "react-router-dom";
import ShowBalance from "./ShowBalance";
function Main (props) {
  const { api, hello, apollo_client } = useSubstrate();
  const [accountInfo, setAccountInfo] = useState(null)
  const [sessionObj, setSessionObj] = useState(null)

  const { acc } = useParams();

  async function getValidatorsAccount() {
    apollo_client.query({
      query: gql`
        query{
          aresAccount(id:"${acc}") {
            stakingTotalReward,
            ref_staking_bonded_events(orderBy: EVENT_BN_DESC){
              nodes{
                whoId,
                eventBn,
                deposit,
                timestring
              }
            },
            ref_staking_chilled_events(orderBy: EVENT_BN_DESC){
              nodes{
                eventBn,
                timestring
              }
            },
            ref_staking_im_online_some_offline_events(orderBy: EVENT_BN_DESC) {
              nodes{
                eventBn,
                type,
                timestring
              }
            }
          }
        }
      `
    }).then(result => {
      let accountInfo = result.data.aresAccount
      console.log("result.data. = ", accountInfo)
      setAccountInfo(accountInfo)
    });
  }

  async function getSessionValidators() {
    apollo_client.query({
      query: gql`
        query{
          sessionNewSessionEvents(orderBy: SESSION_ID_DESC, first: 1) {
            nodes{
              id,
              sessionId,
              timestring,
              validatorSet
            }
          }
        }
      `
    }).then(result => {
      let sessionNodes = result.data.sessionNewSessionEvents.nodes
      if(sessionNodes.length > 0) {
        setSessionObj(result.data.sessionNewSessionEvents.nodes[0])
      }
    });
  }

  function checkInSet(acc) {
      if(sessionObj){
        for(const idx in sessionObj.validatorSet){
          if(sessionObj.validatorSet[idx] == acc) return true
        }
      }
      return false
  }

  useEffect(() => {
    getValidatorsAccount()
    getSessionValidators()
  }, []);

  return (
      <>
        <Grid.Column width={16}>
          <h2>Account {acc}</h2>
          <div>
          </div>
          <Grid.Row>
          {accountInfo?accountInfo.ref_staking_bonded_events.nodes.length>0?
              <div class="ui teal tag label">Bind count: {accountInfo.ref_staking_bonded_events.nodes.length}</div>:null:null}

          {accountInfo?accountInfo.ref_staking_im_online_some_offline_events.nodes.length>0?
              <div class="ui red tag label">Offline count: {accountInfo.ref_staking_im_online_some_offline_events.nodes.length}</div>:null:null}

          {accountInfo?accountInfo.ref_staking_chilled_events.nodes.length>0?
              <div class="ui yellow tag label">Chill count: {accountInfo.ref_staking_chilled_events.nodes.length}</div>:null:null}
          </Grid.Row>
        </Grid.Column>
        <Grid.Column>
          <Grid.Row>
            <br/>
            <div className="ui compact segment">
              <p>目前是否在线[{sessionObj?.sessionId}]: {checkInSet(acc)?<span className={"ui teal tag label"}>在线</span>:<span className={"ui red tag label"}>离线</span>}</p>
              <p>已经领取奖励[<ShowBalance balance={accountInfo?.stakingTotalReward} />]</p>
            </div>
            <br/>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column>
          <h3>质押动作</h3>
          <Table>
            <Table.Row>
              <Table.Cell>Event</Table.Cell>
              <Table.Cell>Deposit</Table.Cell>
              <Table.Cell>Date</Table.Cell>
            </Table.Row>
            {accountInfo?accountInfo.ref_staking_bonded_events.nodes.map((date, idx) => <Table.Row key={idx}>
              <Table.Cell><LinkToSubstrate bn={date.eventBn} /></Table.Cell>
              <Table.Cell><ShowBalance balance={date.deposit} /></Table.Cell>
              <Table.Cell>{date.timestring}</Table.Cell>
            </Table.Row>):null}
          </Table>

          <h3>Offline Events</h3>
          <Table>
            <Table.Row>
              <Table.Cell>Event</Table.Cell>
              <Table.Cell>Type</Table.Cell>
              <Table.Cell>Date</Table.Cell>
            </Table.Row>
            {accountInfo?accountInfo.ref_staking_im_online_some_offline_events.nodes.map((date, idx) => <Table.Row key={idx}>
              <Table.Cell><LinkToSubstrate bn={date.eventBn} /></Table.Cell>
              <Table.Cell>{date.type}</Table.Cell>
              <Table.Cell>{date.timestring}</Table.Cell>
            </Table.Row>):null}
          </Table>

          <h3>Chill Events</h3>
          <Table>
            <Table.Row>
              <Table.Cell>Event</Table.Cell>
              <Table.Cell>Date</Table.Cell>
            </Table.Row>
            {accountInfo?accountInfo.ref_staking_chilled_events.nodes.map((date, idx) => <Table.Row key={idx}>
              <Table.Cell><LinkToSubstrate bn={date.eventBn} /></Table.Cell>
              <Table.Cell>{date.timestring}</Table.Cell>
            </Table.Row>):null}
          </Table>

        </Grid.Column>
      </>

  );
}

export default function ValidatorDetails (props) {
  const { api, apollo_client } = useSubstrate();
  return api && apollo_client ? <Main {...props} /> : null;
}
