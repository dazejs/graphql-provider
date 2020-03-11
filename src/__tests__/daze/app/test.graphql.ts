import { GraphQL } from '../../../index';

@GraphQL()
export default class TestGraphQL {

  hello() {
    return 'Hello GraphQL!';
  }

  helloStr({ str }: any) {
    return `Hello ${str}`;
  }
}

