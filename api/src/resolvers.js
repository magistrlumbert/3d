// import { neo4jgraphql } from 'neo4j-graphql-js'
import neo4j from 'neo4j-driver'
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  )
)
const resolvers = {
  Query: {
    customResolverBgi: async (_, __) => {
      console.log('wish you were here')
      let session = driver.session()
      const cypherQuery = `MATCH(n) RETURN count(n) as count`

      return await session.run(cypherQuery).then((result) => {
        const resData = result.records.map((record) => {
          const owner =
            record.get('count') === null ? null : record.get('owner').properties

          return owner
        })
        return resData
      })
    },

    // getUserCount: async (object, params, ctx, resolveInfo) => {
    //   const result = await neo4jgraphql(object, params, ctx, resolveInfo, true)
    //   return result
    // },
  },
}

export default resolvers
