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


function Main (props) {
  const { api, hello, apollo_client } = useSubstrate();
  const [accountInfo, setAccountInfo] = useState(null)

  const { acc } = props;

  async function getSessionValidators() {
    apollo_client.query({
      query: gql`
        query{
          aresAccount(id:"${acc}") {
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

  useEffect(() => {
    getSessionValidators()
  }, []);

  return (
      <>
        {accountInfo?accountInfo.ref_staking_bonded_events.nodes.length>0?
            <div class="ui teal tag label">Bind count: {accountInfo.ref_staking_bonded_events.nodes.length}</div>:null:null}

        {accountInfo?accountInfo.ref_staking_im_online_some_offline_events.nodes.length>0?
            <div class="ui red tag label">Offline count: {accountInfo.ref_staking_im_online_some_offline_events.nodes.length}</div>:null:null}

        {accountInfo?accountInfo.ref_staking_chilled_events.nodes.length>0?
            <div class="ui yellow tag label">Chill count: {accountInfo.ref_staking_chilled_events.nodes.length}</div>:null:null}
      </>

  );
}

export default function ValidatorLables (props) {
  const { api, apollo_client } = useSubstrate();
  return api && apollo_client ? <Main {...props} /> : null;
}
