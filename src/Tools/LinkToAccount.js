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
// import {useAresContext} from "../substrate-lib/AresContext";

import {
  Link,
  useParams
} from "react-router-dom";

function Main (props) {
  const { acc, min } = props;
  const [isCollapse, setIsCollapse] = useState(min)

  useEffect(() => {
  }, []);

  function shortAddress(ss58) {
    return ss58.substr(0, 4) + '...' + ss58.substr(ss58.length-4, 4)
  }

  function collapse() {
    setIsCollapse(!isCollapse)
    console.log("RUN collapse click")
  }

  return (
      <><Link to={"/account_detail/"+acc}>{isCollapse?shortAddress(acc):acc}</Link><span onClick={()=>collapse()}>[{isCollapse?'+':'-'}]</span></>
  );
}

export default function LinkToAccount (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
