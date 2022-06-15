import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from '@apollo/client';

import config from '../config';

const AresContext = createContext(null);

const AresContextProvider = props => {
  const apollo_client = new ApolloClient({
    uri: config.SUBQUERY_HTTP,
    cache: new InMemoryCache()
  });

  const hello = "Hello world"

  useEffect(() => {
  }, []);

  return (
        <>
            <AresContext.Provider value={{
              apollo_client,
              hello,
            }}>
                {props.children}
            </AresContext.Provider>
        </>
  );
};

// const useAresContext = () => useContext(AresContext);
// // const useAresContextState = () => useContext(AresContext).state;
// export { AresContextProvider, useAresContextState, useAresContext };


const useAresContext = () => ({ ...useContext(AresContext) });
export { AresContextProvider, useAresContext };