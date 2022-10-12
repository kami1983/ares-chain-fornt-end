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
    ['141.164.58.241', 'S1', 'ws://141.164.58.241:9964', 0, '4TS6cxuBJ4AeZttG1fXtViTYLG1P93bb27eCRb76DjNZ13rp'],
    ['141.164.58.241', 'S2', 'ws://141.164.58.241:9965', 0, '4SaqfpkVNvdEstHNWW1C2BmCDJETaKmEAd26KSXDADvLfrjn'],
    ['39.103.174.139', 'S3', 'ws://39.103.174.139:9964', 0, '--'],

    ['158.247.224.166', 'Node6', 'ws://158.247.224.166:9944', 0, '4Py6X6JcHUMtDY1QFfN78N9rVGGo76XdNfUjBHVnTkshx5Xo|4TdKxshT7RPYcfQqez2ZzjsxAo3p8iu4mmACWQDvbGiNzoR9'],
    ['45.77.30.9', 'Node9', 'ws://45.77.30.9:9961', 0, '4Rma6tk2UtaGxPh5dozPz4DVFM2R4wK4iZtXP4kXzKqMv27F'],
    ['45.77.30.9', 'Node9', 'ws://45.77.30.9:9964', 0, '4USEukpUiCMsp7QgEBoBtd17f9P376RupG1YpZRoVcTtowL5'],
    ['202.182.100.187', 'Node11', 'ws://202.182.100.187:9961', 0, '4Qbk2qKYB7yyH2Hvm9sVzWtYMBZ2Uf7Lx3mxytH6gzpKUyXJ'],
    ['202.182.100.187', 'Node11', 'ws://202.182.100.187:9963', 0, '4QwovEknLjgKZwKHNUbEi4TYxomBitYSwrREWPMmatYdeaz7'],

    ['158.247.224.97', 'Node7', 'ws://158.247.224.97:9961', 0, '4UaewssoTRkgaYFJV26zQuGaN4GoGg1zPnMYYb6zWFiQpo49'],
    ['158.247.224.97', 'Node7', 'ws://158.247.224.97:9962', 0, '4Tfhuq5GYtZ9AJ3YQyCmXicGnggyDPyxGpZSCsoGVg9M7fo3'],

    ['149.28.18.50', 'Node10', 'ws://149.28.18.50:9964', 0, '4PxJDptF3qGKJmM69fFNXoFx287TnKDyYmAQ3Emg6a9cDfKL'],
    ['149.28.18.50', 'Node10', 'ws://149.28.18.50:9965', 0, '4TrYpZFpJzLHDVoa21bek5Kih2o2uPmrxhwqe1pTFhWY1T5w'],

    ['149.28.18.50', 'Node10', 'ws://149.28.18.50:9966', 0, '4RbJ7eHeYJfLEetKFx7vdQSm5UqkpxKKTdDda5TqTwaMmH9n'],
    ['149.28.18.50', 'Node10', 'ws://149.28.18.50:9967', 0, '4Q1KhJDpahmFhLzqCK1QvAuK4nQEk4KrQDH1yWu4bviJvXu7'],

    ['167.179.96.132', 'Node14', 'ws://167.179.96.132:9961', 0, '4UMCPmsToxmMjgNPNSd5hA2ARig5Eagbp4BzxDVFTiyEq9F6'],
    ['167.179.96.132', 'Node14', 'ws://167.179.96.132:9962', 0, '4UCeKT5qEH5wd1fhb9XsmvrAW2GxMsRzFXvMPGTibzooXShf'],
    ['167.179.96.132', 'Node14', 'ws://167.179.96.132:9963', 0, '4QEfWWgUwBrfGMRsYZBYno9xFqozYNNmEJSv2ojUKmqfEDDQ'],

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
