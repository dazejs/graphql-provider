import { graphQL, query } from '../../../src';

@graphQL()
export default class HelloGraphql {

  @query()
  hello({ str }: any, { request }: any) {
    const testHeader = request.getHeader('test-header') ?? '';
    return `Hello ${str}${testHeader}`;
  }
}

