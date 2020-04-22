import { GraphQL, Query } from '../../../index';

@GraphQL()
export default class HelloGraphql {

  @Query()
  hello({ str }: any, { request }: any) {
    const testHeader = request.getHeader('test-header') ?? '';
    return `Hello ${str}${testHeader}`;
  }
}

