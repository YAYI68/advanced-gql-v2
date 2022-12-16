const { SchemaDirectiveVisitor } = require('apollo-server')
const { defaultFieldResolver, GraphQLString } = require('graphql')
const {formatDate} = require('./utils')

class FormatDateDirective extends SchemaDirectiveVisitor{
    visitFieldDefinition(field){
        console.log(field)
        const resolvers = field.resolve || defaultFieldResolver
        field.resolve = async(root,{format,...rest},ctx,info)=>{
            const {defaultFormat} = this.args
          const result = await resolvers.call(this,root,rest,ctx,info)
          return formatDate(result, format || defaultFormat)  
        }
    }
}

module.exports = {
    FormatDateDirective
}