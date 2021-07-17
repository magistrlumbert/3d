import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import neo4j from 'neo4j-driver'
// import { Neo4jGraphQL } from '@neo4j/graphql'
import dotenv from 'dotenv'
// set environment variables from .env
dotenv.config()

const resolvers = {
  BGI: {
    __resolveType(obj) {
      if (obj.name) {
        return 'Inventor'
      }
      if (obj.licenseID) {
        return 'Licensee'
      }
      if (obj.orgID) {
        return 'Organization'
      }
      if (obj.patentID) {
        return 'Patent'
      }
      return null // GraphQLError is thrown
    },
  },
  Query: {
    get_bgi: async (_, params, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = `MATCH (n)-[r]-(m)
                          RETURN n, m, r
                          LIMIT 50`
      return await session.run(cypherQuery).then((result) => {
        let nodes = []
        let links = []
        const resData = result.records.map((record) => {
          const n = record.get('n') === null ? null : record.get('n').properties
          let source = {
            ...n,
            ['identity']: record.get('n').identity.toString(),
          }
          const m = record.get('m') === null ? null : record.get('m').properties
          let target = {
            ...m,
            ['identity']: record.get('m').identity.toString(),
          }
          const r = record.get('r') === null ? null : record.get('r').properties
          let link = {
            ...r,
            ['identity']: record.get('r').identity.toString(),
            ['source']: record.get('r').start.toString(),
            ['target']: record.get('r').end.toString(),
            ['type']: record.get('r').type.toString(),
          }

          let found = nodes.some((el) => el.identity === source.identity)
          if (!found) nodes = [...nodes, source]
          found = nodes.some((el) => el.identity === target.identity)
          if (!found) nodes = [...nodes, target]

          links = [...links, link]
          return {
            nodes: nodes,
            links: links,
          }
        })

        return {
          nodes: nodes,
          links: links,
        }
      })
    },
  },
}

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */

// console.log("process.env.NEO4J_URI_BGI", process.env.NEO4J_URI_BGI)
const driver = neo4j.driver(
  process.env.NEO4J_URI_BGI || 'bolt://54.224.51.117:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD_BGI || 'i-08bb780d2ee5c5ec9'
  )
)

const typeDefs = gql`
  union BGI = Inventor | Licensee | Organization | Patent

  extend type Query {
    get_bgi: ResponseBGI
  }
  type ResponseBGI {
    nodes: [BGI]
    links: [RELS]
  }
  type RELS {
    identity: ID!
    source: String
    target: String
    type: String
  }
  type Inventor {
    name: ID!
    identity: String
  }
  type Licensee {
    licenseID: ID!
    identity: String
  }
  type Organization {
    orgID: ID!
    identity: String
  }
  type Patent {
    patentID: ID!
    title: String
    identity: String
  }
`
console.log('sss')
exports.handler = async function (event, context) {
    const server = new ApolloServer({
      context: ({ req }) => {
        return {
          req,
          driver,
        }
      },
    schema: buildFederatedSchema([
			{
				typeDefs,
				resolvers,
			},
		]),
	playground: true,
    introspection: true,
	})

    return new Promise((resolve, reject) => {
        const callback = (err, args) => (err ? reject(err) : resolve(args))
        server.createHandler()(event, context, callback)
    })
}
