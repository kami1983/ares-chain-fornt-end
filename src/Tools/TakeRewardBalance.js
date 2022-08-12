import React, { useEffect, useState } from 'react';
import { useSubstrate } from '../substrate-lib';
import utils from "../substrate-lib/utils"
import {gql} from "@apollo/client";
import ShowBalance from "./ShowBalance";

function Main (props) {
  const { api, hello, apollo_client } = useSubstrate();
  const { era } = props;
  const [refreshCount, setRefreshCount] = useState(0)
  const [stakingRewardBalance, setStakingRewardBalance] = useState(1);


  function fillStakingRewardByEraList(eraNum) {
    apollo_client.query({
      query: gql`
        query{
          stakingRewardedEvents
          (filter:{
            eraNum:{
              equalTo: ${eraNum}
            }
          })
          {
            nodes{
              id,
              whoId,
              eraNum,
              eventBn,
              deposit,
              timestamp,
              timestring
            }
          }
        }
      `
    }).then(result => {
      let nodes = result.data.stakingRewardedEvents.nodes
      let _sumBalance = BigInt(0)
      for (let idx in nodes) {
        _sumBalance+=BigInt(nodes[idx].deposit)
      }
      setStakingRewardBalance(_sumBalance)
    })
  }

  useEffect( () => {
    fillStakingRewardByEraList(era)
  }, [setStakingRewardBalance]);

  return (
      <>
        <span>
          <ShowBalance balance={stakingRewardBalance} />
        </span>
      </>

  );
}

export default function TakeRewardBalance (props) {
  const { api } = useSubstrate();
  const { era } = props;
  return api && era ? <Main {...props} /> : null;
}
