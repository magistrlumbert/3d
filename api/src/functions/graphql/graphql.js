// This module can be used to serve the GraphQL endpoint
// as a lambda function
console.log('graphql workingx')
import { ApolloGateway } from '@apollo/gateway/dist/index'

const { ApolloServer } = require('apollo-server-lambda')

// This module is copied during the build step
// Be sure to run `npm run build`

const gateway = new ApolloGateway({
  // This entire `serviceList` is optional when running in managed federation
  // mode, using Apollo Graph Manager as the source of truth.  In production,
  // using a single source of truth to compose a schema is recommended and
  // prevents composition failures at runtime using schema validation using
  // real usage-based metrics.
  serviceList: [
    // { name: 'bgi', url: process.env.NEO4J_URI_BGI },
    { name: 'bgi', url: 'https://relaxed-keller-93776e.netlify.app/.netlify/functions/bgi' },
    // { name: 'casc', url: 'http://localhost:4003/graphql' },
  ],

  // Experimental: Enabling this enables the query plan view in Playground.
  __exposeQueryPlanExperimental: false,
})

exports.handler = async function (event, context) {
    const server = new ApolloServer({
        gateway,
        playground: true,
        introspection: true,
        subscriptions: false,
    });

    return new Promise((resolve, reject) => {
        const callback = (err, args) => (err ? reject(err) : resolve(args))
        server.createHandler()(event, context, callback)
    })
}
