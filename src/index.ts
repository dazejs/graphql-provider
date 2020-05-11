import { BaseProvider, conf, provider } from '@dazejs/framework/dist';
import GraphQLMiddleware from './core/graphql.middleware';
import { GraphqlConfig } from './core/graphql.config';

@provider()
export class GraphQLProvider extends BaseProvider {

  @conf('app.graphql')
  private conf: any;

  launch(): void | Promise<void> {
    const graphqlConfig = GraphqlConfig.build(this.conf);
    if (graphqlConfig.enable) {
      this.app.get('middleware').register(GraphQLMiddleware, [ graphqlConfig ]);
    }
  }
}

export { GraphQL, graphQL, Query, query, Mutation, mutation, Subscription, subscription, Scalar, scalar } from './core/graphql.decorator';
export * from './core/graphql.middleware';
