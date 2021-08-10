const resolvers = {
  CASIC: {
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
    get_casic: async (_, { query }, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = query
      return await session
        .run(cypherQuery)
        .then((result) => {
          let nodes = []
          let links = []
          let fields = {}
          let rows = {}
          let row = {}
          let i = 0
          result.records.map((record) => {
            record.keys.map((key) => {
              let element = 0
              try {
                element = record.get(key)
                if (element !== null && typeof element.start !== 'undefined') {
                  //rels
                  let link = {
                    ...element.properties,
                    ['identity']: element.identity.toString(),
                    ['source']: element.start.toString(),
                    ['target']: element.end.toString(),
                    ['type']: element.type.toString(),
                  }

                  links = [...links, link]
                } else {
                  //nodes
                  if (element.identity) {
                    let source = {
                      ...element.properties,
                      ['identity']: element.identity.toString(),
                    }
                    let found = nodes.some(
                      (el) => el.identity === source.identity
                    )
                    if (!found) nodes = [...nodes, source]
                  } else {
                    //columns
                    //fetch element to the row
                    //add row to the common list (object)//check if key already in the fields
                    if (key in fields) {
                      //new row
                      //close new row and save row to the object list
                      rows = { ...rows, [i]: row }
                      fields = {}
                      row = {}
                    }
                    fields = { ...fields, [key]: key }
                    row[key] = element.toString()
                    i++
                  }
                }
              } catch (error) {
                console.log(error.message)
              }
            })
            rows = { ...rows, [i]: row }
            return true
          })
          const json = {
            data: rows,
            fields: fields,
          }

          const answer = {
            nodes: nodes,
            links: links,
            columns: JSON.stringify(json),
          }
          return answer
        })
        .catch((error) => {
          console.log(error.message)
          return {
            error: error.message,
          }
        })
    },
  },
}
export default resolvers
