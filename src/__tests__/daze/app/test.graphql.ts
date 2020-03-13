import { GraphQL, Query } from '../../../index';

@GraphQL()
export default class TestGraphQL {

  @Query()
  hello() {
    return 'Hello GraphQL!';
  }

  @Query()
  helloStr(_: any, { str }: any) {
    return `Hello ${str}`;
  }
}

