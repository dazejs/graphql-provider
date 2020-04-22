import { Middleware, Request, Response, TNext } from "@dazejs/framework";
import { execute, getOperationAST, parse, Source, specifiedRules, validate } from 'graphql';
import { GraphqlConfig } from './graphql.config';
import { GraphqlAnalyzer } from './graphql.analyzer';
import { order } from '@dazejs/framework/dist/decorators/order';

@order(Number.MAX_SAFE_INTEGER + 1)
export default class GraphQLMiddleware extends Middleware {
  private readonly graphqlConfig: GraphqlConfig;
  private readonly analyzer: GraphqlAnalyzer;

  constructor(graphqlConfig: GraphqlConfig) {
    super();
    this.graphqlConfig = graphqlConfig;
    this.analyzer = new GraphqlAnalyzer(this.app).analyze();
  }

  async resolve(request: Request | any, next: TNext): Promise<Response> {
    if (!this.isGraphQLRequest(request)) {
      return next();
    }

    // 1. Parse http query body
    const graphQLParams = await this.parseGraphQLParams(request);
    const source = new Source(graphQLParams.query, 'GraphQL Request');
    const document = parse(source);
    // 2. Check query & operation if valid
    const validErrors = validate(this.analyzer.mergedSchema, document, [...specifiedRules]);
    if (validErrors.length > 0) {
      return this.response().error(`Query is invalid: ${validErrors[0]}`, 400);
    }
    const operation = getOperationAST(document, graphQLParams.operationName);
    if (request.isGet() && operation && operation.operation !== 'query') {
      return this.response().error(`${operation.operation} should not use GET http type.`, 400);
    }

    // 3. Execute schema for results
    const result = execute(this.analyzer.mergedSchema, document,
      { }, { request, req: request },
      graphQLParams.variables, graphQLParams.operationName,
      undefined, undefined
    );

    if (request.url?.startsWith(this.graphqlConfig.graphiqlUri)) {
      const html = this.analyzer.renderGraphiQL({
        query: graphQLParams.query,
        variables: graphQLParams.variables,
        operationName: graphQLParams.operationName,
        result
      });
      return this.response().setType('html').setData(html);
    } else {
      return this.response().setData(result);
    }
  }

  private isGraphQLRequest(request: Request): boolean {
    return request.url?.startsWith(this.graphqlConfig.uri)
      || (this.graphqlConfig.graphiql && request.url?.startsWith(this.graphqlConfig.graphiqlUri))
      || false;
  }

  /**
   * Parse graphql params from http request
   */
  async parseGraphQLParams(request: Request): Promise<GraphQLParams> {
    // 1. parse query
    let query = request.getParam('query');
    let variables = request.getParam('variables');
    let operationName = request.getParam('operationName');
    if (!query) {
      const body = request.getBody();
      if (request.is('application/graphql')) {
        query = body;
      }
      // other type with raw json body
      else if (typeof body === 'string') {
        try {
          const rawBodyObj = JSON.parse(body);
          query = rawBodyObj.query;
          if (!variables) {
            variables = rawBodyObj.variables;
          }
          if (!operationName) {
            operationName = rawBodyObj.operationName;
          }
        } catch (err) {
          // ignore
        }
      }
    }

    if (typeof variables === 'string') {
      variables = JSON.parse(variables);
    }
    if (typeof operationName !== 'string') {
      operationName = null;
    }
    return { query, variables, operationName };
  }
}

export interface GraphQLParams {
  query: string;
  variables?: object;
  operationName?: string;
}
