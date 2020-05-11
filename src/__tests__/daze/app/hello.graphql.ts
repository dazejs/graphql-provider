import { graphQL, query } from '../../../index';

@graphQL()
export default class HelloGraphql {

  @query()
  hello({ str }: any, { request }: any) {
    const testHeader = request.getHeader('test-header') ?? '';
    return `Hello ${str}${testHeader}`;
  }
}

