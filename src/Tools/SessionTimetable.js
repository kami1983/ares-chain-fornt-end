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


// import {useAresContext} from "../substrate-lib/AresContext";

// const {apollo_client, hello} = useAresContext()

function Main (props) {
  const { api, hello, apollo_client } = useSubstrate();

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  const [sessionTable, setSessionTable] = useState([]);
  const [imonlieDataList, setImonlieDataList] = useState([]);
  const [chilledDataList, setChilledDataList] = useState([]);
  const [stakingRewardRecordList, setStakingRewardRecordList] = useState(null);
  const [totalAmountOfRewardRecord, setTotalAmountOfRewardRecord] = useState(null);

  async function getSessionTable() {
    apollo_client.query({
      query: gql`
        query{
          sessionNewSessionEvents(orderBy:TIMESTAMP_DESC, last: 10000){
            nodes{
              sessionId,
              timestamp,
              timestring,
              validatorCount,
              validatorSet,
              stakingCurrentEra,
              stakingActiveEra
              eventBn
            }
          }
        }
      `
    }).then(result => {
      let nodes = result.data.sessionNewSessionEvents.nodes
      console.log("result.data. = ", nodes)
      setSessionTable(nodes)
    });
  }

  async function getImonlineData() {
    apollo_client.query({
      query: gql`
        query{
          imOnlineSomeOfflineEvents(orderBy:TIMESTAMP_DESC){
            nodes{
              id,
              eventBn,
              timestring
            }
          }
        }
      `
    }).then(result => {
      let nodes = result.data.imOnlineSomeOfflineEvents.nodes
      console.log("imOnlineSomeOfflineEvents.data. = ", nodes)
      setImonlieDataList(nodes)
    });
  }

  async function getChilledData() {
    apollo_client.query({
      query: gql`
        query{
          stakingChilledEvents(orderBy:TIMESTAMP_DESC){
            nodes{
              id,
              eventBn,
              timestring
            }
          }
        }
      `
    }).then(result => {
      let nodes = result.data.stakingChilledEvents.nodes
      console.log("stakingChilledEvents.data. = ", nodes)
      setChilledDataList(nodes)
    });
  }

  async function getEraRewardData(eraNum) {
    apollo_client.query({
      query: gql`
        query{
          stakingRewardRecords{
            nodes{
              id,
              eventBn,
              stakingEra,
              erasValidatorReward
            }
          }
        }
      `
    }).then(result => {
      let nodes = result.data.stakingRewardRecords.nodes
      console.log("stakingRewardRecord = ", nodes)
      setStakingRewardRecordList(nodes)
    });
  }

  // query{
  // 	totalAmountOfRewardRecord(id:"TotalAmountOfRewardRecord"){
  //     id,
  //     totalRewardOfMinted,
  //     totalRewardOfClaimed
  //   }
  // }
  async function getTotalAmountOfRewardRecord(eraNum) {
    apollo_client.query({
      query: gql`
        query{
          totalAmountOfRewardRecord(id:"TotalAmountOfRewardRecord"){
            id,
            totalRewardOfMinted,
            totalRewardOfClaimed
          }
        }
      `
    }).then(result => {
      let recordObj = result.data.totalAmountOfRewardRecord
      console.log("stakingRewardRecord = ", recordObj)
      setTotalAmountOfRewardRecord(recordObj)
    });
  }

  function getValidatorOfUp(dataArr, idx) {
    const nextDataObj = sessionTable[idx+1]
    let newValidatorArr = []
    if(nextDataObj) {
      const nextDataArr = nextDataObj.validatorSet
      for(const i in dataArr){
        let haveFound = false
        for(const x in nextDataArr){
          if(dataArr[i] == nextDataArr[x]) {
            haveFound = true
            break
          }
        }
        if(!haveFound){
          newValidatorArr.push(dataArr[i])
        }
      }
      return newValidatorArr
    }
    return []
  }

  function getValidatorOfDown(dataArr, idx) {
    const nextDataObj = sessionTable[idx+1]
    let downValidatorArr = []
    if(nextDataObj) {
      const nextDataArr = nextDataObj.validatorSet
      for(const i in nextDataArr){
        let haveFound = false
        for(const x in dataArr){
          if(nextDataArr[i] == dataArr[x]) {
            haveFound = true
            break
          }
        }
        if(!haveFound){
          downValidatorArr.push(nextDataArr[i])
        }
      }
      return downValidatorArr
    }
    return []
  }

  function countOfImonline(bn) {
    if(imonlieDataList.length == 0){
      return null
    }
    let resCount = 0;
    imonlieDataList.map(data=>{
      // console.log(`${data.eventBn} == {resCount}`)
      if(data.eventBn == bn){
        resCount++
      }
    });
    if(0 == resCount) {
      return null;
    }
    return resCount
  }

  function countOfChilled(bn) {
    if(chilledDataList.length == 0){
      return null
    }
    let resCount = 0;
    chilledDataList.map(data=>{
      // console.log(`${data.eventBn} == {resCount}`)
      if(data.eventBn == bn){
        resCount++
      }
    });
    if(0 == resCount) {
      return null;
    }
    return resCount
  }

  function showEraReward(eraNum) {
    for(const idx in stakingRewardRecordList) {
      console.log("showEraReward == ", `${stakingRewardRecordList[idx].stakingEra} == ${eraNum}`)
      if(stakingRewardRecordList[idx].stakingEra == eraNum) {
        return stakingRewardRecordList[idx].erasValidatorReward
      }
    }
    return 0
  }

  useEffect(() => {
    getSessionTable()
    getImonlineData()
    getChilledData()
    getEraRewardData()
    getTotalAmountOfRewardRecord()
  }, []);

  return (
        <Grid.Column width={16}>
          <h2>Session Timetable</h2>
          <a className="ui left labeled icon button" href={"/"}>
            <i className="left arrow icon"></i>
            HOME
          </a>
          <h4>产生的奖励总额：{totalAmountOfRewardRecord?<ShowBalance balance={totalAmountOfRewardRecord.totalRewardOfMinted}/>:null}</h4>
          <h4>被领取走的总额：{totalAmountOfRewardRecord?<ShowBalance balance={totalAmountOfRewardRecord.totalRewardOfClaimed}/>:null}</h4>
          <Table>
            <Table.Row>
              <Table.Cell>Session Id</Table.Cell>
              <Table.Cell>时间</Table.Cell>
              <Table.Cell>事件发生区块</Table.Cell>
              <Table.Cell>ERA(C/A)</Table.Cell>
              <Table.Cell>验证人总数</Table.Cell>
              <Table.Cell>离线数</Table.Cell>
              <Table.Cell>撤离数</Table.Cell>
              <Table.Cell>奖励</Table.Cell>
              <Table.Cell>下线列表</Table.Cell>
              <Table.Cell>上线列表</Table.Cell>
            </Table.Row>
            {sessionTable.map((data, idx) =><Table.Row key={idx}>
              <Table.Cell><Link to={"/session_validator/"+data.sessionId}>{data.sessionId}</Link></Table.Cell>
              <Table.Cell>{data.timestring}</Table.Cell>
              <Table.Cell><LinkToSubstrate bn={data?.eventBn} /></Table.Cell>
              <Table.Cell>{data?.stakingCurrentEra}/{data?.stakingActiveEra}</Table.Cell>
              <Table.Cell>{data?.validatorCount}</Table.Cell>
              <Table.Cell>{data?countOfImonline(data?.eventBn):null}</Table.Cell>
              <Table.Cell>{data?countOfChilled(data?.eventBn):null}</Table.Cell>
              <Table.Cell>{data?<ShowBalance balance={showEraReward(data?.stakingActiveEra)} /> :null}</Table.Cell>
              <Table.Cell>{getValidatorOfDown(data.validatorSet, idx).map(downAcc=><div><LinkToAccount acc={downAcc} min={true}/></div>)}</Table.Cell>
              <Table.Cell>{getValidatorOfUp(data.validatorSet, idx).map(upAcc=><div><LinkToAccount acc={upAcc} min={true}/></div>)}</Table.Cell>
            </Table.Row>)}
          </Table>

        </Grid.Column>
  );
}

export default function SessionTimetable (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
