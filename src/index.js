const {ApolloServer,SchemaDirectiveVisitor} = require('apollo-server')
const { defaultFieldResolver,GraphQLString  } = require('graphql')
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const {createToken, getUserFromToken} = require('./auth')
const db = require('./db')
const { FormatDateDirective,AuthenticationDirective,AuthorizationDirective } = require('./directives')

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field){
     //  Passing and args from the client side
    field.args.push({
      type:GraphQLString,
      name:'message',
    }) 

    const resolver = field.resolve ? field.resolve : defaultFieldResolver
    field.resolve = (root,{message,...rest},ctx,info)=>{
      const { serverMessage } = this.args
      console.log('Hi Hello',message || serverMessage)
     return resolver.call(this, root,rest,ctx,info)
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives:{
    formatDate:FormatDateDirective,
    log:LogDirective,
    authenticated:AuthenticationDirective,
    authorized:AuthorizationDirective,
  },
  context({req,connection}) {
    const context = {...db}
    if (connection){
      console.log({connection})
       return {...context,...connection.context}
    }
    const token = req.headers.authorization
    const user = getUserFromToken(token)
    return {...context, user, createToken}
  },
  subscriptions:{
    onConnect(params){
      const token = params.Authorization
      const user = getUserFromToken(token)
      if(!user){
        throw new Error("Nope not Authenticated")
      }
      return {user}
    }
  }
})

server.listen(4000).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`)
})
