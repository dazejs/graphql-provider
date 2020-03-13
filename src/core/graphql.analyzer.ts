import * as glob from 'glob';
import * as path from "path";
import * as fs from "fs";
import { buildSchema, GraphQLSchema, validateSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypes } from 'merge-graphql-schemas';
import {
  GRAPHQL_MUTATION_TYPE,
  GRAPHQL_QUERY_TYPE, GRAPHQL_SUBSCRIPTION_TYPE,
  GRAPHQL_TYPE,
  GRAPHQL_TYPE_OBJ,
  GraphQLMetadata
} from './graphql.decorator';
import { Application } from '@dazejs/framework/dist';

export class GraphqlAnalyzer {

  private readonly app: Application;
  public graphqlMethod: GraphQLMethod;
  public mergedSchema: GraphQLSchema;

  constructor(app: Application) {
    this.app = app;
  }

  analyze(): GraphqlAnalyzer {
    // 1. scan for all graphql type files
    const schemas = this.scanForSchemas();
    this.graphqlMethod = this.buildMethods();
    // 2. build resolvers
    const resolvers = this.buildResolvers();
    // 3. merge all schemas and make executable
    const typeDefs = mergeTypes(schemas, { all: true });
    this.mergedSchema = makeExecutableSchema({
      typeDefs,
      resolvers,
      resolverValidationOptions: {
        allowResolversNotInSchema: true
      }
    });
    return this;
  }

  private scanForSchemas(): Array<GraphQLSchema> {
    const filePaths = glob.sync(path.join(this.app.configPath, '**/*.graphql'), {
      nodir: true,
      matchBase: true
    });
    return filePaths
      .map((p) => fs.readFileSync(p, { encoding: 'utf-8' }))
      .map(content => {
        const schema = buildSchema(content);
        validateSchema(schema);
        return schema;
      });
  }

  private buildMethods(): GraphQLMethod {
    const queries: Array<Function> = [];
    const mutations: Array<Function> = [];
    const subscriptions: Array<Function> = [];
    const typeMethods = new Map<string, Array<Function>>();

    const graphQLTypes: Map<Function, GraphQLMetadata> = Reflect.getMetadata(GRAPHQL_TYPE, GRAPHQL_TYPE_OBJ) ?? new Map();
    graphQLTypes.forEach((metadata) => {
      if (!this.app.has(metadata.abstract)) {
        this.app.singleton(metadata.abstract, metadata.abstract);
      }
      const graphQLInstance = this.app.get(metadata.abstract);
      const queryTypes = Reflect.getMetadata(GRAPHQL_QUERY_TYPE, metadata.abstract) ?? new Map();
      const mutationTypes = Reflect.getMetadata(GRAPHQL_MUTATION_TYPE, metadata.abstract) ?? new Map();
      const subscriptionTypes = Reflect.getMetadata(GRAPHQL_SUBSCRIPTION_TYPE, metadata.abstract) ?? new Map();

      Reflect.ownKeys(metadata.abstract.prototype)
        .map((m) => m.toString())
        .filter((m) => m !== 'constructor' && typeof graphQLInstance[m] === 'function')
        .forEach((m) => {
          const method = graphQLInstance[m].bind(graphQLInstance);
          // TODO: check duplicates
          let has = false;
          if (queryTypes.has(m)) {
            queries.push(method);
            has = true;
          }
          if (mutationTypes.has(m)) {
            mutations.push(method);
            has = true;
          }
          if (subscriptionTypes.has(m)) {
            subscriptions.push(method);
            has = true;
          }
          if (!has) {
            const others = typeMethods.get(metadata.abstract.name) ?? [];
            others.push(method);
            typeMethods.set(metadata.abstract.name, others);
          }
        });
    });
    return { queries, mutations, subscriptions, typeMethods };
  }

  private buildResolvers(): any {
    const typeObject: any = { };
    this.graphqlMethod.typeMethods.forEach((values, key) => {
      typeObject[key] = values?.reduce((r: any, v: any) => { r[v.name] = v; return r;}, { });
    });
    return {
      Query: this.graphqlMethod.queries?.reduce((r: any, v: any) => { r[v.name.split(" ")[1]] = v; return r;}, { }),
      Mutation: this.graphqlMethod.mutations?.reduce((r: any, v: any) => { r[v.name] = v; return r;}, { }),
      Subscription: this.graphqlMethod.subscriptions?.reduce((r: any, v: any) => { r[v.name] = v; return r;}, { }),
      ...typeObject
    };
  }
}

declare type GraphQLMethod = {
  queries: Array<Function>;
  mutations: Array<Function>;
  subscriptions: Array<Function>;
  typeMethods: Map<string, Array<Function>>;
}
