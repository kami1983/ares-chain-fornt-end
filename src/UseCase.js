import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, GridRow} from 'semantic-ui-react';
import {BrowserRouter} from "react-router-dom";
import { Routes, Route, Link } from "react-router-dom";

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
import TemplateModule from "./TemplateModule";
import NodeInfo from "./NodeInfo";
import Metadata from "./Metadata";
import UseCaseStaking from "./UseCaseStaking";
import UseCaseHome from "./UseCaseHome";
import UseCaseChainPriceData from "./UseCaseChainPriceData";
import UseCaseAbnormalPriceData3 from "./UseCaseAbnormalPriceData3";
import UseCaseValidatorRewardOfOracle from "./UseCaseValidatorRewardOfOracle";
import UseCaseAskPriceData from "./UseCaseAskPriceData";


function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  useEffect(async () => {
      const lastHeader = await api.rpc.chain.getHeader();
      // Log the information
      console.log(` last block #${lastHeader.number} has hash ${lastHeader.hash}`);

      await api.rpc.offchain.localStorageGet("PERSISTENT", "0x6172652d6f63773a3a70726963655f726571756573745f646f6d61696e").then((res)=>{
          console.log('localStorage', res.isSome, res.value.toHuman());
      });

  }, []);

  return (
      <Grid.Column width={16}>
          <BrowserRouter>
              <div className="App">
                  <h1><Link to="/">前端测试用例</Link></h1>
                  <Routes>
                      <Route path="/" element={<UseCaseHome />} />
                      <Route path="case_staking" element={<UseCaseStaking />} />
                      <Route path="chain_price_data" element={<UseCaseChainPriceData />} />
                      <Route path="abnormal_price_data" element={<UseCaseAbnormalPriceData3 />} />
                      <Route path="ask_price_data" element={<UseCaseAskPriceData />} />
                      <Route path="validator_reward_of_oracle" element={<UseCaseValidatorRewardOfOracle />} />

                  </Routes>
              </div>
          </BrowserRouter>
      </Grid.Column>
  );
}

export default function UseCase (props) {
    return <Main {...props} />
}
