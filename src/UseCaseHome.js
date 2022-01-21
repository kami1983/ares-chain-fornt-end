import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, GridRow} from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
import {Link} from "react-router-dom";

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  useEffect(() => {
  }, []);

  return (
    <Grid.Column width={16}>
      <Grid.Row><Link to="/case_staking">Ares-Oracle &amp Staking &amp Session - 链上数据核验工具</Link></Grid.Row>
      <Grid.Row><Link to="/chain_price_data">Ares-Oracle - 链上报价数据</Link></Grid.Row>
      <Grid.Row><Link to="/abnormal_price_data">Ares-Oracle - 异常报价数据</Link></Grid.Row>
      <Grid.Row><Link to="/ask_price_data">Ares-Oracle - 付费询价数据请求</Link></Grid.Row>
      <Grid.Row><Link to="/validator_reward_of_oracle">Ares-Oracle - 验证人奖励[Oracle]</Link></Grid.Row>
    </Grid.Column>
  );
}

export default function UseCaseHome (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
