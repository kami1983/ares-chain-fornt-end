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
import {Keyring} from "@polkadot/api";
import {u8aToHex} from "@polkadot/util";

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  const [status, setStatus] = useState(null);
  const [checkAddress, setCheckAddress] = useState('');
  const [formState, setFormState] = useState({ addressTo: '', amount: 0 });
  const [preCheckTaskList, setPreCheckTaskList] = useState([]);
  const [finalPerCheckStatus, setFinalPerCheckStatus] = useState([]);
  const [waitValidatorList, setWaitValidatorList] = useState([]);
  const [waitValidatorSessionKeyList, setWaitValidatorSessionKeyList] = useState([]);
  const [initStatus, setInitStatus] = useState(false);
  const [localXRay, setLocalXray] = useState([]);

  const onChange = (_, data) => {
    // console.log('data = ', data);
    setFormState(prev => ({ ...prev, [data.state]: data.value }));
  };
  const { addressTo, amount } = formState;
  const availableAccounts = [];

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  accounts.map(account => {
    return availableAccounts.push({ key: account.meta.name, text: account.meta.name, value: account.address });
  });

  async function loadPreCheckTaskList () {
    const authorities = await api.query.aresOracle.preCheckTaskList();
    setPreCheckTaskList(authorities);
    return authorities;
  }

  async function loadAresAuthorities () {
    const authorities = await api.query.aresOracle.authorities();
    setPreCheckTaskList(authorities);
    return authorities;
  }

  async function loadFinalPerCheckResult (address) {
    const authorities = await api.query.aresOracle.authorities();
  }

  async function loadStakingValidators () {
    const exposures = await api.query.staking.validators.entries();
    const resultList = [];
    exposures.forEach(([key, exposure]) => {
      const tmp = key.args.map((k) => k.toHuman());
      resultList.push(tmp[0]);
    });
    return resultList;
  }

  // Offchain key : 0x6172652d6f63773a3a6c6f63616c5f686f73745f6b6579
  // 0x0efb90aee5f197d6f710f886924260e98e65d2b09ec04c301362bc476b4d9e6f7c1a7836044da7489fb6ac28ade841ec27d9eb1e5e8682dea96ff637e8db179a20a8cd33d9bf55d81179422d94b49ff93c2b9d3980b08aaada4c01f8351f6157021a58ea857a5f2819c0c108ef01c1b8d106c5625dd91d396f8da16834bd56860c9af5c68b4c313686ffffddd74e87e729332c5d262f561919ea4c48be736e1402
  async function loadOracleLocalXRay () {
    const exposures = await api.query.aresOracle.localXRay.entries();
    const resultList = [];
    exposures.forEach(([key, exposure]) => {
      const tmpKey = key.args.map((k) => k.toHuman());
      const tmpExposure = exposure.toHuman();
      resultList.push(
        {
          host_key: tmpKey[0],
          commit_bn: tmpExposure[0],
          warehouse: tmpExposure[1],
          authorities: tmpExposure[2],
          full_hex: exposure.toHex()
        }
      );
    });

    // console.log('AAA == ', decode_value);
    // console.log('BBB == ', u8aToHex(keyring.decodeAddress('4SJT3cozQ7Uv31M8A1q5ysarUEtv58xcoA5GgWBnoZ3b7G5w')));
    return resultList;
  }

  async function loadSessionValidators () {
    return api.query.session.validators();
  }

  async function countStakingWaitValidators () {
    const sessionValidators = await loadSessionValidators();
    const stakingValidators = await loadStakingValidators();
    sessionValidators.map(sessionStash => {
      const removeIdx = stakingValidators.findIndex((element) => element == sessionStash.toHuman());
      stakingValidators.splice(removeIdx, 1);
    });
    return stakingValidators;
  }

  async function getSessionKeys (stashId) {
    return api.query.session.nextKeys(stashId);
  }

  async function getFinalPerCheckResult (stashId) {
    return api.query.aresOracle.finalPerCheckResult(stashId);
  }

  function getFinalStatus (stashId) {
    const status = finalPerCheckStatus[stashId];
    if (status.isNone) {
      return '「None」';
    }
    return `「${status.value}」`;
  }

  useEffect(async () => {
    console.log('addressTo = ', addressTo);
    console.log('amount = ', amount);

    // get waiting list
    if (!initStatus) {
      setInitStatus(true);
      await loadPreCheckTaskList();
      await setLocalXray(await loadOracleLocalXRay());
      await setWaitValidatorList(await countStakingWaitValidators());
    }

    const tmpWaitList = [];
    for (const idx in waitValidatorList) {
      const stashId = waitValidatorList[idx];
      tmpWaitList.push({ stash_id: stashId, session_key: await getSessionKeys(stashId) });
      const status = await getFinalPerCheckResult(stashId);
      finalPerCheckStatus[stashId] = status;
    }
    await setWaitValidatorSessionKeyList(tmpWaitList);
    await setFinalPerCheckStatus(finalPerCheckStatus);
  }, [formState, waitValidatorList]);

  return (
        <Grid.Column width={16}>
            <h1>Ares - Use cases staking.</h1>
            <GridRow>
                <h3>等待中的验证人：</h3>
                {waitValidatorSessionKeyList.map(waitAcc => <Container fluid>
                    <div>
                        <div>验证人：{waitAcc.stash_id} <Rating icon='star' clearable defaultRating={0} maxRating={3}/></div>
                        <div>Final Check Result: {getFinalStatus(waitAcc.stash_id)}</div>
                        <div>Session key：<Input fluid value={waitAcc.session_key.value.toHex()}/></div>
                    </div>
                    <div>----</div>
                </Container>)}
            </GridRow>
            <GridRow>
                <Form>
                    <GridRow>
                        <h3>提审任务列表：</h3>
                        <div>preCheckTaskList:</div>
                        {preCheckTaskList.map(account =>
                            <Container>
                                <div>验证人：{account[0].toHuman()} <Rating icon='star' clearable defaultRating={0}
                                                                        maxRating={3}/></div>
                                <div>Auth：{account[1].toHuman()}</div>
                                <div>AuthHex：{account[1].toHex()}</div>
                                <div>提审区块：{account[2].toHuman()}</div>
                                <div>----</div>
                            </Container>
                        )}
                    </GridRow>
                    {/*<Form.Field>*/}
                    {/*    <Input*/}
                    {/*        fluid*/}
                    {/*        label='To'*/}
                    {/*        type='text'*/}
                    {/*        placeholder='address'*/}
                    {/*        value={checkAddress.value}*/}
                    {/*        onChange={setCheckAddress}*/}
                    {/*    />*/}
                    {/*</Form.Field>*/}
                    {/*<Form.Field style={{ textAlign: 'center' }}>*/}
                    {/*    <Button>Check</Button>*/}
                    {/*</Form.Field>*/}
                </Form>
            </GridRow>
           <GridRow>
            <h3>验证人Local数据：</h3>
            {localXRay.map(hostInfo => <Container fluid>
              <div>
                <div>节点HostKey：{hostInfo.host_key} <Rating icon='star' clearable defaultRating={0} maxRating={3}/></div>
                <div>提交区块: {hostInfo.commit_bn} , Era = {hostInfo.commit_bn/600}</div>
                <div>节点Warehouse: {hostInfo.warehouse}</div>
                <div>本地Ares authoritys: {hostInfo.authorities.map(authority => <div>
                  <div>{authority}</div>
                  <div>ToPublic: {u8aToHex(keyring.decodeAddress(authority))} </div>
                </div>)}</div>
              </div>
              <div>----</div>
            </Container>)}
           </GridRow>
            {/* <GridRow> */}
            {/*    <h3>提审中的列表：</h3> */}
            {/*    <div>preCheckTaskList:</div> */}
            {/*    <div>finalPerCheckResult:</div> */}
            {/* </GridRow> */}
        </Grid.Column>
  );
}

export default function UseCaseStaking (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
