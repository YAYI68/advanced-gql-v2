const resolvers = require('../src/resolvers')
// Another way to create a test is using graphql from graphql
// const graphql = require('graphql')

describe("resolvers",() => {
    test('feed',()=>{
   const result = resolvers.Query.feed(null,null,{models:{Post:{findMany(){
            return ["Hello"]
        }}}})
        expect(result).toEqual(["Hello"])
    })
})