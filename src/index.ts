import { Provider } from '@dazejs/framework/dist';
import { Depend, ProvideOnConfig } from '@dazejs/framework/dist/decorators/provider';
import GraphQLMiddleware from './core/graphql.middleware';

@Depend()
@ProvideOnConfig('app.graphql')
export class GraphQLProvider extends Provider {

  register(): void | Promise<void> {
    this.app.get('middleware').register(GraphQLMiddleware, [ this.app ]);
  }

}
