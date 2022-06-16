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
import {Link} from "react-router-dom";
import LinkToSubstrate from "./LinkToSubstrate";
import LinkToAccount from "./LinkToAccount";
import ShowBalance from "./ShowBalance";
import config from "../config";


// import {useAresContext} from "../substrate-lib/AresContext";
import utils from "../substrate-lib/utils"


function Main (props) {
  const { api, hello, apollo_client } = useSubstrate();

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  const [stakingTable, setStakingTable] = useState([]);
  const [rewardMintTable, setRewardMintTable] = useState([]);

  async function loadStakingTable() {
    apollo_client.query({
      query: gql`
        query{
          stakingErasTotalStakeRecords(orderBy: ERA_DESC){
            nodes{
              era,
              deposit
            }
          }
        }
      `
    }).then(result => {
      let nodes = result.data.stakingErasTotalStakeRecords.nodes
      console.log("staking-table.data. = ", nodes)
      setStakingTable(nodes)
    });
  }


  async function loadRewardMintTable() {
    apollo_client.query({
      query: gql`
        query{
          stakingRewardRecords(orderBy: STAKING_ERA_DESC){
            nodes{
              eventBn,
              stakingEra,
              erasValidatorReward
            }
          }
        }
      `
    }).then(result => {
      let nodes = result.data.stakingRewardRecords.nodes
      setRewardMintTable(nodes)
    });
  }

  function getRewardMintBalance(checkEra) {
    if(rewardMintTable){
      for(const idx in rewardMintTable) {
        if(rewardMintTable[idx].stakingEra == checkEra) {
          return rewardMintTable[idx].erasValidatorReward
        }
      }
    }
    return null;
  }

  function getEarningsYield(a, b) {
    if(a == null || b == null) {
      return 0.0
    }
    return   ( utils.convertBalanceToFloat(a)/ utils.convertBalanceToFloat(b) * config.HOW_MANY_ERA_PER_DAY * 365 * 100).toFixed(4)
  }

  useEffect(() => {
    loadStakingTable()
    loadRewardMintTable()
  }, []);

  return (
        <Grid.Column width={16}>
          <h2>Staking Timetable</h2>
          <a className="ui left labeled icon button" href={"/"}>
            <i className="left arrow icon"></i>
            HOME
          </a>
          {/*<h4>产生的奖励总额：{totalAmountOfRewardRecord?<ShowBalance balance={totalAmountOfRewardRecord.totalRewardOfMinted}/>:null}</h4>*/}
          {/*<h4>被领取走的总额：{totalAmountOfRewardRecord?<ShowBalance balance={totalAmountOfRewardRecord.totalRewardOfClaimed}/>:null}</h4>*/}
          <Table>
            <Table.Row>
              <Table.Cell>Era</Table.Cell>
              <Table.Cell>奖励金额</Table.Cell>
              <Table.Cell>质押金额</Table.Cell>
              <Table.Cell>收益率(APY)</Table.Cell>
            </Table.Row>
            {stakingTable.map((data, idx) =><Table.Row key={idx}>
              <Table.Cell>{data.era}</Table.Cell>
              <Table.Cell>{rewardMintTable?<ShowBalance balance={getRewardMintBalance(data.era)} />:null}</Table.Cell>
              <Table.Cell><ShowBalance balance={data.deposit} /></Table.Cell>
              <Table.Cell>{getEarningsYield(getRewardMintBalance(data.era), data.deposit)} %</Table.Cell>
            </Table.Row>)}
          </Table>
        </Grid.Column>
  );
}

export default function StakingTimetable (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
