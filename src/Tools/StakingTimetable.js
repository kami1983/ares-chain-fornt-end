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
import TakeRewardBalance from "./TakeRewardBalance"
import config from "../config";


// import {useAresContext} from "../substrate-lib/AresContext";
import utils from "../substrate-lib/utils"


function Main (props) {
  const { api, hello, apollo_client } = useSubstrate();

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  const [stakingTable, setStakingTable] = useState([]);
  const [rewardMintTable, setRewardMintTable] = useState([]);
  const [pageInfo, setPageInfo] = useState([0, 100]);
  const [showLoading, setShowLoading] = useState(true);

  // const [stakingEraPaidList, setStakingEraPaidList] = useState([]);

  // async function loadStakingEraPaid(eraNum) {
  //   apollo_client.query({
  //     query: gql`
  //       query{
  //         stakingEraPaidEvents
  //         (filter:{
  //           eraNum:{equalTo:${eraNum}}
  //         })
  //         {
  //           nodes{
  //             id,
  //             remainder,
  //             validatorPayout,
  //             eraNum,
  //             eventBn
  //           }
  //         }
  //       }
  //     `
  //   }).then(result => {
  //     let _stakingEraPaidNodes = stakingEraPaidList
  //     _stakingEraPaidNodes[eraNum]=result.data.stakingEraPaidEvents.nodes
  //     setStakingEraPaidList(_stakingEraPaidNodes)
  //   })
  // }

  // async function getTreasuryPayout(eraNum) {
  //   if (setStakingEraPaidList[eraNum]) {
  //     return eraNum
  //   }
  //   // else {
  //   //   await loadStakingEraPaid(eraNum)
  //   //   if (setStakingEraPaidList[eraNum]) {
  //   //     return eraNum
  //   //   }
  //   // }
  //   return 'Era 未结束'
  // }

  async function loadStakingTable() {
    const query_sql = `query{
          stakingErasTotalStakeRecords(orderBy: ERA_DESC, offset:${pageInfo[0]}, first:${pageInfo[1]}){
            nodes{
              era,
              deposit
            }
          }
        }`

    apollo_client.query({
      query: gql`
        ${query_sql}
      `
    }).then(result => {
      let nodes = result.data.stakingErasTotalStakeRecords.nodes
      let fullStakeTable = []
      for(const idx in stakingTable) {
        fullStakeTable.push(stakingTable[idx])
      }
      for(const idx in nodes) {
        fullStakeTable.push(nodes[idx])
      }

      setStakingTable(fullStakeTable)
      setShowLoading(false)
    });
  }

  function nextPage() {
    const offset = pageInfo[0]
    const first = pageInfo[1]
    setPageInfo([offset+first, first])
    setShowLoading(true)
  }

  async function loadRewardMintTable() {
    apollo_client.query({
      query: gql`
        query {
          stakingRewardRecords(orderBy: STAKING_ERA_DESC, offset:${pageInfo[0]}, first:${pageInfo[1]}){
            nodes{
              id,
              eventBn,
              stakingEra,
              erasValidatorReward,
              remainder,
              validatorPayout
            }
          }
        }
      `
    }).then(result => {
      let nodes = result.data.stakingRewardRecords.nodes

      let fullMintTable = []
      for(const idx in rewardMintTable) {
        fullMintTable.push(rewardMintTable[idx])
      }
      for(const idx in nodes) {
        fullMintTable.push(nodes[idx])
      }

      setRewardMintTable(fullMintTable)
      setShowLoading(false)
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

  function getEraRemainder(checkEra) {
    if(rewardMintTable){
      for(const idx in rewardMintTable) {
        if(rewardMintTable[idx].stakingEra == checkEra) {
          return rewardMintTable[idx].remainder
        }
      }
    }
    return null;
  }

  function getEraValidatorPayout(checkEra) {
    if(rewardMintTable){
      for(const idx in rewardMintTable) {
        if(rewardMintTable[idx].stakingEra == checkEra) {
          return rewardMintTable[idx].validatorPayout
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
  }, [pageInfo]);

  return (
        <Grid.Column width={16}>
          <Grid.Row>
            <h2>Staking Timetable</h2>
            <a className="ui left labeled icon button" href={"/"}>
              <i className="left arrow icon"></i>
              HOME
            </a>
          <Table>
            <Table.Row>
              <Table.Cell>Era</Table.Cell>
              <Table.Cell>奖励金额</Table.Cell>
              <Table.Cell>质押金额</Table.Cell>
              <Table.Cell>收益率(APY)</Table.Cell>
              <Table.Cell>进入国库</Table.Cell>
              <Table.Cell>支付给验证人</Table.Cell>
              <Table.Cell>被领走的奖励</Table.Cell>
            </Table.Row>
            {stakingTable.map((data, idx) =><Table.Row key={idx}>
              {console.log('^^^^^',data)}
              <Table.Cell>{data.era}</Table.Cell>
              <Table.Cell>{rewardMintTable?<ShowBalance balance={getRewardMintBalance(data.era)} />:null}</Table.Cell>
              <Table.Cell><ShowBalance balance={data.deposit} /></Table.Cell>
              <Table.Cell>{getEarningsYield(getRewardMintBalance(data.era), data.deposit)} %</Table.Cell>
              <Table.Cell>{rewardMintTable?<ShowBalance balance={getEraRemainder(data.era)} />:null}</Table.Cell>
              <Table.Cell>{rewardMintTable?<ShowBalance balance={getEraValidatorPayout(data.era)} />:null}</Table.Cell>
              <Table.Cell>
                {/*<ShowBalance balance={getStakingRewardBalance(data.era)} />*/}
                {/*<div>*/}
                {/*  {stakingRewardList[data.era]}*/}
                {/*</div>*/}
                <TakeRewardBalance era={data.era} />
              </Table.Cell>
            </Table.Row>)}
          </Table>
          </Grid.Row>
          {!showLoading?<Grid.Row>
            <button className="fluid ui button" onClick={()=>nextPage()}>More infos</button>
          </Grid.Row>:null}

        </Grid.Column>
  );
}

export default function StakingTimetable (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
