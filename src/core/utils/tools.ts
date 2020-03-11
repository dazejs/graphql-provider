import { GraphQLSchema } from 'graphql';


export default function mergeSchemas(schemas: string[] | GraphQLSchema[], resolvers: any[]): GraphQLSchema {
  if (!schemas || schemas.length == 0) {
    throw new Error(`Schemas cannot be empty`);
  }

  const allSchemas: GraphQLSchema[] = [];

  schemas.forEach(schema => {

    if (schema instanceof GraphQLSchema) {
      allSchemas.push(schema);
      const queryType = schema.getQueryType();
      const mutationType = schema.getMutationType();
      const subscriptionType = schema.getSubscriptionType();


    }



  });


  return null;

}
