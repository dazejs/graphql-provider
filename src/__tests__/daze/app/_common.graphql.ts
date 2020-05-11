import { graphQL, scalar } from '../../../core/graphql.decorator';
import { Kind } from 'graphql';

@graphQL('Common')
export class CommonGraphql {

  @scalar('Date')
  dateResolver() {
    return {
      name: 'Date',
      description: 'Date custom scalar type',
      parseValue(value: any) {
        return new Date(value); // value from the client
      },
      serialize(value: any) {
        return value.getTime() + 1; // value sent to the client
      },
      parseLiteral(ast: any) {
        if (ast.kind === Kind.INT) {
          return new Date(+ast.value); // ast value is always in string format
        }
        return null;
      },
    };
  }

}
