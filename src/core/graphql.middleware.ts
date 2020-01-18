import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';

import { Middleware, Request, Response } from "@dazejs/framework";
import { TNext } from "@dazejs/framework/dist/middleware";
import { Application } from '@dazejs/framework';
import { parse, buildSchema, validate, specifiedRules, validateSchema, getOperationAST, execute, GraphQLSchema, Source } from 'graphql';

export default class GraphQLMiddleware extends Middleware {

  private readonly schema: GraphQLSchema;

  constructor(app: Application) {
    super();
    const filePaths = glob.sync(path.join(app.configPath, '**/*.graphql'), {
      nodir: true,
      matchBase: true
    });
    for (const p of filePaths) {
      const content = fs.readFileSync(p, { encoding: 'utf-8' });
      this.schema = buildSchema(content); // TODO: multi files & valid
      validateSchema(this.schema);
    }
  }

  async resolve(request: Request, next: TNext): Promise<Response> {

    if (!this.isGraphQLRequest(request)) {
      return next();
    }

    console.log('graphql .....................');

    const graphQLParams = await this.parseGraphQLParams(request);
    const source = new Source(graphQLParams.query, 'GraphQL request');
    const document = parse(source);
    const validErrors = validate(this.schema, document, [ ...specifiedRules ]); // Check errors
    if (validErrors.length > 0) {
      return this.response().error('', 400);

    }

    const operation = getOperationAST(document, undefined);
    if (request.isGet() && operation && operation.operation !== 'query') {
      return this.response().error('', 400);
    }

    const root = { hello: () => 'Hello GraphQL!' };
    const result = execute(this.schema, document, root, null, graphQLParams.variables, "", undefined, undefined);
    return this.response().setData(result);
  }

  private isGraphQLRequest(request: Request): boolean {
    // application/graphql
    // /graphql
    return request.url?.startsWith("/graphql") || false;
  }

  private async parseGraphQLParams(request: Request): Promise<GraphQLParams> {
    const query = request.getParam("query");
    // TOOD: application/graphql
    let variables = request.getParam("variables");
    if (typeof variables === 'string') {
      variables = JSON.parse(variables);
    }
    return { query, variables };
  }
}


export interface GraphQLParams {
  query: string;
  variables?: object;
}
