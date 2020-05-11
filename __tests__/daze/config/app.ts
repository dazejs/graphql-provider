import { GraphQLProvider } from '../../../src';

export default {
  port: 8888,
  providers: [
    GraphQLProvider
  ],
  graphql: {
    graphiql: true
  }
};
