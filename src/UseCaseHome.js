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
      {/*<Grid.Row><Link to="/case_staking">Ares-Oracle & Staking & Session - Validator check tools</Link></Grid.Row>*/}
      {/*<Grid.Row><Link to="/chain_price_data">Ares-Oracle - On-chain price data</Link></Grid.Row>*/}
      {/*<Grid.Row><Link to="/abnormal_price_data">Ares-Oracle - Abnormal price data</Link></Grid.Row>*/}
      {/*<Grid.Row><Link to="/ask_price_data">Ares-Oracle - Paid ask request</Link></Grid.Row>*/}
      {/*<Grid.Row><Link to="/pre_check_data">Ares-Oracle - Validator Audit</Link></Grid.Row>*/}
      {/*<Grid.Row><Link to="/validator_reward_of_oracle">Ares-Oracle - Validator Reward[Oracle]</Link></Grid.Row>*/}
        {/*<Grid.Row><Link to="/paid_order_list">Ares-Oracle - Paid order list</Link></Grid.Row>*/}
      {/*<Grid.Row><Link to="/session_table">Tools - Session Timetable</Link></Grid.Row>*/}
        <Grid.Row>
            <div className="ui three column grid">
                <div className="column">
                    <div className="ui segment">
                        <Link to="/case_staking">Ares-Oracle & Staking & Session - Validator check tools</Link>
                    </div>
                </div>
                <div className="column">
                    <div className="ui segment">
                        <Link to="/session_table">Tools - Session Timetable</Link>
                    </div>
                </div>
                <div className="column">
                    <div className="ui segment">
                        <Link to="/staking_table">Tools - Staking Timetable</Link>
                    </div>
                </div>
                <div className="column">
                    <div className="ui segment">
                        <Grid.Row><Link to="/chain_price_data">Ares-Oracle - On-chain price data</Link></Grid.Row>
                    </div>
                </div>
            </div>
        </Grid.Row>
    </Grid.Column>
  );
}

export default function UseCaseHome (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
