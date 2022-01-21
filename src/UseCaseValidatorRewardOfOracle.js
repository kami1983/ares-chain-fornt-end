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

import { useSubstrate } from './substrate-lib';


function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  const { keyring } = useSubstrate();
  const accounts = keyring.getPairs();

  useEffect(async () => {
  }, []);

  return (
        <Grid.Column width={16}>
            <h2>异常报价数据.</h2>
            <Table celled striped size='small'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>PriceKey</Table.Cell>
                  <Table.Cell>异常报价</Table.Cell>
                  <Table.Cell>报价人</Table.Cell>
                  <Table.Cell>报价区块</Table.Cell>
                  <Table.Cell>时间戳</Table.Cell>
                  <Table.Cell>解析整数</Table.Cell>
                  <Table.Cell>解析小数</Table.Cell>
                  <Table.Cell>小数长度</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
        </Grid.Column>
  );
}

export default function UseCaseValidatorRewardOfOracle (props) {
  const { api } = useSubstrate();
  return api.query.session ? <Main {...props} /> : null;
}
