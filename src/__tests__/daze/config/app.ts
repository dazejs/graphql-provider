import { GraphQLProvider } from '../../../index';

export default {
  port: 8888,
  providers: [
    GraphQLProvider
  ],
  graphql: {
    graphiql: true
  }
};
