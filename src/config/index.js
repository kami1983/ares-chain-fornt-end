import configCommon from './common.json';
// Using `require` as `import` does not support dynamic loading (yet).

let hostName = 'odyssey';
if(window.location.host.search('gladios') > -1){
  hostName = 'gladios'
}

const configEnv = require(`./${process.env.NODE_ENV}.${hostName}.json`);
require('dotenv').config();

// Accepting React env vars and aggregating them into `config` object.
const envVarNames = [
  'REACT_APP_PROVIDER_SOCKET',
  'REACT_APP_DEVELOPMENT_KEYRING',
  'REACT_APP_SUBQUERY_HTTP'
];
const envVars = envVarNames.reduce((mem, n) => {
  // Remove the `REACT_APP_` prefix
  if (process.env[n] !== undefined) mem[n.slice(10)] = process.env[n];
  return mem;
}, {});
console.log('####################', window.location.host, envVars, process.env);
const config = { ...configCommon, ...configEnv, ...envVars };
export default config;
