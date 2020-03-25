import { Provider } from '@dazejs/framework/dist';
import { Config } from '@dazejs/framework/dist/decorators';
import { Depend } from '@dazejs/framework/dist/decorators/provider';
import GraphQLMiddleware from './core/graphql.middleware';
import { GraphqlConfig } from './core/graphql.config';

@Depend()
export class GraphQLProvider extends Provider {

  @Config('app.graphql')
  private conf: any;

  launch(): void | Promise<void> {
    const graphqlConfig = GraphqlConfig.build(this.conf);
    if (graphqlConfig.enable) {
      this.app.get('middleware').register(GraphQLMiddleware, [ graphqlConfig ]);
    }
  }
}

export { GraphQL, Query, Mutation, Subscription } from './core/graphql.decorator';
export * from './core/graphql.middleware';
