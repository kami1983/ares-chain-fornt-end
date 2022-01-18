import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, GridRow, Label, Icon, Dropdown, Button, Table } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { symbol } from 'prop-types';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  const [status, setStatus] = useState(null);
  const [checkAddress, setCheckAddress] = useState('');
  const [formState, setFormState] = useState({ addressTo: '', amount: 0 });
  const [preCheckTaskList, setPreCheckTaskList] = useState([]);
  const [waitValidatorList, setWaitValidatorList] = useState([]);
  const [waitValidatorSessionKeyList, setWaitValidatorSessionKeyList] = useState([]);

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
    const authorities = await api.query.aresOracle.authorities();
    // console.log('authorities === ', authorities.length);
    // console.log('authorities === ', authorities[0][0].toHuman());
    // console.log('authorities === ', authorities[0][1].toHuman());
    setPreCheckTaskList(authorities);
    return authorities;
    // for authorities
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

  async function loadSessionValidators () {
    return api.query.session.validators();
  }

  async function countStakingWaitValidators () {
    const sessionValidators = await loadSessionValidators();
    const stakingValidators = await loadStakingValidators();
    console.log('stakingValidators', stakingValidators);

    const resultList = [];
    sessionValidators.map(sessionStash => {
      const removeIdx = stakingValidators.findIndex((element) => element == sessionStash.toHuman());
      stakingValidators.splice(removeIdx, 1);
    });
    return stakingValidators;
  }

  async function getSessionKeys (stashId) {
    return api.query.session.nextKeys(stashId);
  }

  useEffect(async () => {
    console.log('addressTo = ', addressTo);
    console.log('amount = ', amount);
    loadPreCheckTaskList();

    // get waiting list
    if (waitValidatorList.length === 0) {
      setWaitValidatorList(await countStakingWaitValidators());
    }

    waitValidatorList.map(async stashId => {
        let tmpVal = {stash_id: stashId, session_key: await getSessionKeys(stashId)};
        waitValidatorSessionKeyList.push(tmpVal);
    });
      setWaitValidatorSessionKeyList(waitValidatorSessionKeyList);
      console.log("-------", waitValidatorSessionKeyList.length, waitValidatorSessionKeyList);
      waitValidatorSessionKeyList.forEach((element)=>{
          console.log('-----' ,element);
      });
  }, [formState, waitValidatorList, waitValidatorSessionKeyList]);

  return (
        <Grid.Column width={8}>
            <h1>Ares - Use cases staking.</h1>
            <GridRow>
                <h3>等待的验证人：</h3>
                {waitValidatorSessionKeyList.map(waitAcc => <div>
                    <div>验证人：{waitAcc.stash_id} SessionKeys: {waitAcc.session_key} </div>
                </div>)}
            </GridRow>
            <GridRow>
                <Form>
                {/* <Form.Field> */}
                {/*    <Dropdown */}
                {/*        placeholder='Select from available addresses' */}
                {/*        fluid */}
                {/*        selection */}
                {/*        search */}
                {/*        options={availableAccounts} */}
                {/*        state='addressTo' */}
                {/*        onChange={onChange} */}
                {/*    /> */}
                {/* </Form.Field> */}
                    <GridRow>
                        <h3>aresOracle</h3>
                        <div>preCheckTaskList: </div>
                        {preCheckTaskList.map(account =>
                            <div>
                                <div>验证人：{account[0].toHuman()} </div>
                                <div>Auth：{account[1].toHuman()}</div><div>----</div>
                            </div>
                        )}
                    </GridRow>
                <Form.Field>
                    <Input
                        fluid
                        label='To'
                        type='text'
                        placeholder='address'
                        value={checkAddress.value}
                        onChange={setCheckAddress}
                    />
                </Form.Field>
                <Form.Field style={{ textAlign: 'center' }}>
                    <Button>Check</Button>
                </Form.Field>
                </Form>
            </GridRow>
            <GridRow>
                <h3>aresOracle</h3>
                <div>preCheckTaskList: </div>
                <div>finalPerCheckResult: </div>
            </GridRow>
        </Grid.Column>
  );
}

export default function UseCaseStaking (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
