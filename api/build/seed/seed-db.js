"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _client = require("@apollo/client");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _seedMutations = require("./seed-mutations");

_dotenv.default.config();

const {
  GRAPHQL_SERVER_HOST: host,
  GRAPHQL_SERVER_PORT: port,
  GRAPHQL_SERVER_PATH: path
} = process.env;
const uri = `http://${host}:${port}${path}`;
const client = new _client.ApolloClient({
  link: new _client.HttpLink({
    uri,
    fetch: _nodeFetch.default
  }),
  cache: new _client.InMemoryCache()
});

const runMutations = async () => {
  const mutations = await (0, _seedMutations.getSeedMutations)();
  return _promise.default.all((0, _map.default)(mutations).call(mutations, ({
    mutation,
    variables
  }) => {
    return client.mutate({
      mutation,
      variables
    }).catch(e => {
      throw new Error(e);
    });
  }));
};

runMutations().then(() => {
  console.log('Database seeded!');
}).catch(e => console.error(e));