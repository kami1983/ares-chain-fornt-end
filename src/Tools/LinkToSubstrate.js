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
require('dotenv').config();

import {
  Link,
  useParams
} from "react-router-dom";

function Main (props) {
  const { bn } = props;

  useEffect(() => {
  }, []);

  return (
      <a href={`https://polkadot.js.org/apps/?rpc=${process.env.REACT_APP_PROVIDER_SOCKET}#/explorer/query/${bn}`}>{bn}</a>
  );
}

export default function LinkToSubstrate (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
