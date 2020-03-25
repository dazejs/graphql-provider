import { GraphQL, Query } from '../../../index';

@GraphQL()
export default class HelloGraphql {

  @Query()
  hello(_: any, { str }: any) {
    return `Hello ${str}`;
  }
}

