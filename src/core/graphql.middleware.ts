import { Middleware, Request, Response, TNext } from "@dazejs/framework";
import { parse, validate, specifiedRules, getOperationAST, execute, GraphQLSchema, Source } from 'graphql';
import { GraphqlConfig } from './graphql.config';
import { GraphqlAnalyzer } from './graphql.analyzer';

export default class GraphQLMiddleware extends Middleware {
  private readonly graphqlConfig: GraphqlConfig;
  private readonly schema: GraphQLSchema;

  constructor(graphqlConfig: GraphqlConfig) {
    super();
    this.graphqlConfig = graphqlConfig;
    const analyzer = new GraphqlAnalyzer(this.app).analyze();
    this.schema = analyzer.mergedSchema;
  }

  async resolve(request: Request | any, next: TNext): Promise<Response> {
    if (!this.isGraphQLRequest(request)) {
      return next();
    }

    console.log('graphql .....................');

    const graphQLParams = await this.parseGraphQLParams(request);
    const source = new Source(graphQLParams.query, 'GraphQL request');
    const document = parse(source);
    const validErrors = validate(this.schema, document, [...specifiedRules]); // Check errors
    if (validErrors.length > 0) {
      return this.response().error('', 400);
    }

    const operation = getOperationAST(document, undefined);
    if (request.isGet() && operation && operation.operation !== 'query') {
      return this.response().error('', 400);
    }

    const result = execute(this.schema, document, null, null, graphQLParams.variables, "", undefined, undefined);
    return this.response().setData(result);
  }

  private isGraphQLRequest(request: Request): boolean {
    return request.url?.startsWith(this.graphqlConfig.uri) || false;
  }

  private async parseGraphQLParams(request: Request): Promise<GraphQLParams> {
    const query = request.getParam("query");
    // TODO: application/graphql
    let variables = request.getParam("variables");
    if (typeof variables === 'string') {
      variables = JSON.parse(variables);
    }
    return {query, variables};
  }
}

export interface GraphQLParams {
  query: string;
  variables?: object;
}
