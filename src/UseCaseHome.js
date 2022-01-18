import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, GridRow} from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  useEffect(() => {
  }, []);

  return (
    <Grid.Column width={8}>
      Ares-Chain Use case.
    </Grid.Column>
  );
}

export default function UseCaseHome (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
