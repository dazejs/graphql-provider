import * as glob from 'glob';
import * as path from "path";
import * as fs from "fs";
import { buildSchema, GraphQLSchema, validateSchema } from 'graphql';
import { mergeSchemas } from 'graphql-tools';
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

    // 2. create resolvers
    const resolvers = {
      Query: {
        hello: () => "hhh",
        helloStr: (_: any, {str}: any) => {
          return `Hello ${str}`;
        }
      }
    };

    // 3. merge schemas
    this.mergedSchema = mergeSchemas({ schemas, resolvers });
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

    // const mergedSchema = makeExecutableSchema({
    //   typeDefs: `type Query { hello: String! \n helloStr(str: String!): String! }`,
    //   resolvers: {
    //     Query: {
    //       hello: () => "hhh",
    //       helloStr: (_, {str}) =>  {
    //         return `hello ${str}`;
    //       }
    //     } }});

    // return mergedSchema;
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
}

declare type GraphQLMethod = {
  queries: Array<Function>;
  mutations: Array<Function>;
  subscriptions: Array<Function>;
  typeMethods: Map<string, Array<Function>>;
}
