import React, { useReducer, useContext } from 'react';
import PropTypes from 'prop-types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import queryString from 'query-string';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';

import config from '../config';

const parsedQuery = queryString.parse(window.location.search);
const connectedSocket = parsedQuery.rpc || config.PROVIDER_SOCKET;
console.log(`Connected socket: ${connectedSocket}`);

///
// Initial state for `useReducer`

const INIT_STATE = {
  socket: connectedSocket,
  jsonrpc: { ...jsonrpc, ...config.RPC },
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null
};

///
// Reducer function for `useReducer`

const reducer = (state, action) => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state, apiState: 'CONNECT_INIT' };

    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' };

    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' };

    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload };

    case 'LOAD_KEYRING':
      return { ...state, keyringState: 'LOADING' };

    case 'SET_KEYRING':
      return { ...state, keyring: action.payload, keyringState: 'READY' };

    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: 'ERROR' };

    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

///
// Connecting to the Substrate node

const types = {
  Address: 'MultiAddress',
  AskPeriodNum: 'u64',
  AskPointNum: 'u32',
  AuthorityAres: 'AccountId',
  AccountParticipateEstimates: {
    account: 'AccountId',
    end: 'BlockNumber',
    estimates: 'Option<u64>',
    range_index: 'Option<u8>',
    eth_address: 'Option<Bytes>',
    multiplier: 'MultiplierOption',
    reward: 'u128'
  },
  AresPriceData: {
    price: 'u64',
    account_id: 'AccountId',
    create_bn: 'BlockNumber',
    fraction_len: 'FractionLength',
    raw_number: 'JsonNumberValue',
    timestamp: 'u64'
  },
  BalanceOf: 'Balance',
  ChooseWinnersPayload: {
    block_number: 'BlockNumber',
    winners: 'Vec<AccountParticipateEstimates>',
    public: 'AccountId',
    estimates_config: 'Bytes',
    symbol: 'Bytes',
    price: '(u64, FractionLength)'
  },
  EstimatesState: {
    _enum: [
      'InActive',
      'Active',
      'WaitingPayout',
      'Completed'
    ]
  },
  EstimatesType: {
    _enum: [
      'DEVIATION', 'RANGE'
    ]
  },
  FractionLength: 'u32',
  HttpError: {
    _enum: {
      IoErr: 'Bytes',
      TimeOut: 'Bytes',
      StatusErr: '(Bytes,u16)',
      ParseErr: 'Bytes'
    }
  },
  HttpErrTracePayload: {
    trace_data: 'HttpErrTraceData<BlockNumber, AuthorityId>',
    auth: 'AuthorityId',
    public: 'MultiSigner'
  },
  HttpErrTraceData: {
    block_number: 'BlockNumber',
    err_auth: 'AuthorityId',
    err_status: 'HttpError',
    tip: 'Bytes'
  },
  JsonNumberValue: {
    integer: 'u64',
    fraction: 'u64',
    fraction_length: 'u32',
    exponent: 'u32'
  },
  Keys: 'SessionKeys3',
  LookupSource: 'MultiAddress',
  MultiplierOption: {
    _enum: [
      'Base1', 'Base2', 'Base5'
    ]
  },
  OcwControlData: {
    need_verifier_check: 'bool',
    open_free_price_reporter: 'bool',
    open_paid_price_reporter: 'bool'
  },
  OffchainSignature: 'MultiSignature',
  PaidValue: {
    create_bn: 'BlockNumber',
    amount: 'BalanceOf',
    is_income: 'bool'
  },
  PurchasedId: 'Bytes',
  PriceKey: 'Bytes',
  PriceToken: 'Bytes',
  PreCheckPayload: {
    block_number: 'BlockNumber',
    pre_check_stash: 'AccountId',
    pre_check_auth: 'AuthorityId',
    auth: 'AuthorityId',
    public: 'MultiSigner'
  },
  PreCheckResultPayload: {
    block_number: 'BlockNumber',
    pre_check_list: 'Vec<PreCheckStruct>',
    pre_check_stash: 'AccountId',
    pre_check_auth: 'AuthorityId',
    public: 'MultiSigner'
  },
  PreCheckCompareLog: {
    chain_avg_price_list: 'BTreeMap<Bytes, (u64, FractionLength)>',
    validator_up_price_list: 'BTreeMap<Bytes, (u64, FractionLength)>',
    raw_precheck_list: 'Vec<PreCheckStruct>'
  },
  PreCheckStruct: {
    price_key: 'Vec<u8>',
    number_val: 'JsonNumberValue',
    max_offset: 'Percent',
    timestamp: 'u64'
  },
  PricePayloadSubPrice: '(PriceKey, u64, FractionLength, JsonNumberValue, u64)',
  PricePayloadSubJumpBlock: '(PriceKey, RequestInterval)',
  PricePayload: {
    block_number: 'BlockNumber',
    price: 'Vec<PricePayloadSubPrice>',
    jump_block: 'Vec<PricePayloadSubJumpBlock>',
    auth: 'AuthorityId',
    public: 'MultiSigner'
  },
  PreCheckStatus: {
    _enum: [
      'Review',
      'Prohibit',
      'Pass'
    ]
  },
  PurchasedRequestData: {
    account_id: 'AccountId',
    offer: 'BalanceOf',
    create_bn: 'BlockNumber',
    submit_threshold: 'u8',
    max_duration: 'u64',
    request_keys: 'Vec<Vec<u8>>'
  },
  PurchasedPricePayload: {
    block_number: 'BlockNumber',
    purchase_id: 'Vec<u8>',
    price: 'Vec<PricePayloadSubPrice>',
    auth: 'AuthorityId',
    public: 'MultiSigner'
  },
  PurchasedAvgPriceData: {
    create_bn: 'u64',
    reached_type: 'u8',
    price_data: '(u64, FractionLength)'
  },
  PurchasedDefaultData: {
    submit_threshold: 'u8',
    max_duration: 'u64',
    avg_keep_duration: 'u64'
  },
  PurchasedForceCleanPayload: {
    BlockNumber: 'BlockNumber',
    purchase_id_list: 'Vec<Vec<u8>>',
    auth: 'AuthorityId',
    public: 'MultiSigner'
  },
  PurchaseId: 'Vec<u8>',
  Releases: {
    _enum: [
      'V1_0_0_Ancestral',
      'V1_0_1_HttpErrUpgrade',
      'V1_1_0_HttpErrUpgrade',
      'V1_2_0'
    ]
  },
  RequestInterval: 'u8',
  StatusErr: '(u16)',
  SymbolEstimatesConfig: {
    symbol: 'Bytes',
    estimates_type: 'EstimatesType',
    id: 'u64',
    ticket_price: 'Balance',
    symbol_completed_price: 'u64',
    symbol_fraction: 'FractionLength',
    start: 'BlockNumber',
    end: 'BlockNumber',
    distribute: 'BlockNumber',
    deviation: 'Option<Permill>',
    range: 'Option<Vec<u64>>',
    total_reward: 'Balance',
    state: 'EstimatesState'
  }
}

const connect = (state, dispatch) => {
  const { apiState, socket, jsonrpc } = state;
  // We only want this function to be performed once
  if (apiState) return;

  dispatch({ type: 'CONNECT_INIT' });

  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc: jsonrpc, types });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then((_api) => dispatch({ type: 'CONNECT_SUCCESS' }));
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }));
  _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', payload: err }));
};

///
// Loading accounts from dev and polkadot-js extension

let loadAccts = false;
const loadAccounts = (state, dispatch) => {
  const asyncLoadAccounts = async () => {
    dispatch({ type: 'LOAD_KEYRING' });
    try {
      await web3Enable(config.APP_NAME);
      let allAccounts = await web3Accounts();
      allAccounts = allAccounts.map(({ address, meta }) =>
        ({ address, meta: { ...meta, name: `${meta.name} (${meta.source})` } }));
      keyring.loadAll({ isDevelopment: config.DEVELOPMENT_KEYRING }, allAccounts);
      dispatch({ type: 'SET_KEYRING', payload: keyring });
    } catch (e) {
      console.error(e);
      dispatch({ type: 'KEYRING_ERROR' });
    }
  };

  const { keyringState } = state;
  // If `keyringState` is not null `asyncLoadAccounts` is running.
  if (keyringState) return;
  // If `loadAccts` is true, the `asyncLoadAccounts` has been run once.
  if (loadAccts) return dispatch({ type: 'SET_KEYRING', payload: keyring });

  // This is the heavy duty work
  loadAccts = true;
  asyncLoadAccounts();
};

const SubstrateContext = React.createContext();

const SubstrateContextProvider = (props) => {
  // filtering props and merge with default param value
  const initState = { ...INIT_STATE };
  const neededPropNames = ['socket'];
  neededPropNames.forEach(key => {
    console.log('neededPropNames.forEach', key);
    initState[key] = (typeof props[key] === 'undefined' ? initState[key] : props[key]);
  });

  const [state, dispatch] = useReducer(reducer, initState);
  connect(state, dispatch);
  loadAccounts(state, dispatch);

  return <SubstrateContext.Provider value={state}>
    {props.children}
  </SubstrateContext.Provider>;
};

// prop typechecking
SubstrateContextProvider.propTypes = {
  socket: PropTypes.string
};

const useSubstrate = () => ({ ...useContext(SubstrateContext) });

export { SubstrateContextProvider, useSubstrate };
