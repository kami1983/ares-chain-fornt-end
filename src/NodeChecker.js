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
  Rating
} from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { ApiPromise, WsProvider } from '@polkadot/api';


function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  const [nodeList, setNodeList] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const initList = [

  ]

  async function checkAllNodes() {
    for (let idx in nodeList) {
      console.log('++check', idx)
      await checkNodeConnection(idx)
    }
  }
  async function checkNodeConnection(index) {

    if (nodeList[index]) {
      const wsProvider = new WsProvider(nodeList[index][2]);
      try{
        ApiPromise.create({provider: wsProvider}).then(api=>{
          nodeList[index][3] = 2
          if(api){
            const genesisHash = api.genesisHash.toHex()
            console.log('genesisHash = ', genesisHash)
            if(genesisHash && genesisHash!='') {
              nodeList[index][3] = 1
            }else{
              nodeList[index][3] = 2
            }
          }
          let tmpList = []
          for(let idx in nodeList) {
            tmpList[idx] = nodeList[idx]
          }
          setNodeList(tmpList)
        }).catch(err=>{
          console.log('err == ', err)
        })
      }catch (err) {}
    }
  }

  useEffect(async () => {

    if(nodeList.length == 0){
      setNodeList(initList)
    }
  }, [nodeList]);

  return (
        <Grid.Column width={16}>
            <h1>Nodes checker.</h1>
            <Button onClick={()=>{checkAllNodes()}}>Check node status</Button>
            <GridRow>
              <Table>
                <Table.Row>
                  <Table.Cell>IP</Table.Cell>
                  <Table.Cell>Name</Table.Cell>
                  <Table.Cell>RPC</Table.Cell>
                  <Table.Cell>Status</Table.Cell>
                  <Table.Cell>Tip</Table.Cell>
                </Table.Row>
                <Table.Body>
                  {nodeList.map(data=><Table.Row>
                    <Table.Cell>
                      {data[0]}
                    </Table.Cell>
                    <Table.Cell>
                      {data[1]}
                    </Table.Cell>
                    <Table.Cell>
                      {data[2]}
                    </Table.Cell>
                    <Table.Cell>
                      {data[3]==1?'✔':data[3]=='0'?'--':'✘'}
                    </Table.Cell>
                    <Table.Cell>
                      {data[4]}
                    </Table.Cell>
                  </Table.Row>)}
                </Table.Body>
              </Table>
            </GridRow>
        </Grid.Column>
  );
}

export default function NodeChecker (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
