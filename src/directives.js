const { SchemaDirectiveVisitor, AuthenticationError } = require('apollo-server')
const { defaultFieldResolver, GraphQLString } = require('graphql')
const {formatDate} = require('./utils')

class FormatDateDirective extends SchemaDirectiveVisitor{
    visitFieldDefinition(field){

        const resolvers = field.resolve || defaultFieldResolver
        const {format:defaultFormat} = this.args
        field.args.push({
            type:GraphQLString,
            name:'format'
        })
       
        field.resolve = async(root,{format,...rest},ctx,info)=>{
          const result = await resolvers.call(this,root,rest,ctx,info)
          return formatDate(result, format || defaultFormat)  
        }
    }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field){
        const resolver = field.resolve || defaultFieldResolver
        field.resolve = (root,args,ctx,info)=>{
            if(!ctx.user){
                throw new AuthenticationError("User needs to sign in")
            }
         return resolver.call(this,root,args,ctx,info)
        }
    }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field){
        const {role} = this.args
        const resolver = field.resolve || defaultFieldResolver
        field.resolve = (root,args,ctx,info)=>{
            if(ctx.user.role !== role){
                throw new AuthenticationError("User is not allowed to view this route")
            }
         return resolver.call(this,root,args,ctx,info)
        }
    }
}

module.exports = {
    FormatDateDirective,
    AuthenticationDirective,
    AuthorizationDirective
}