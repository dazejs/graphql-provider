import * as glob from 'glob';
import * as path from "path";
import * as fs from "fs";
import { GraphQLSchema } from 'graphql';
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
    const schemasContent = this.scanForSchemasContent();
    this.graphqlMethod = this.buildMethods();
    // 2. build resolvers
    const resolvers = this.buildResolvers();
    // 3. merge all schemas and make executable
    const typeDefs = mergeTypes(schemasContent, { all: true });
    this.mergedSchema = makeExecutableSchema({
      typeDefs,
      resolvers,
      resolverValidationOptions: {
        allowResolversNotInSchema: true
      }
    });
    return this;
  }

  private scanForSchemasContent(): Array<string> {
    const filePaths = glob.sync(path.join(this.app.configPath, '**/*.graphql'), {
      nodir: true,
      matchBase: true
    });
    return filePaths
      .map(p => fs.readFileSync(p, { encoding: 'utf-8' }));
  }

  private buildMethods(): GraphQLMethod {
    const queries: GFunction[] = [];
    const mutations: GFunction[] = [];
    const subscriptions: GFunction[] = [];
    const typeMethods = new Map<string, GFunction[]>();

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
          const method = this.makeResolver(graphQLInstance[m]).bind(graphQLInstance);
          // TODO: check duplicates
          let has = false;
          if (queryTypes.has(m)) {
            queries.push({ name: m, func: method });
            has = true;
          }
          if (mutationTypes.has(m)) {
            mutations.push({ name: m, func: method });
            has = true;
          }
          if (subscriptionTypes.has(m)) {
            subscriptions.push({ name: m, func: method });
            has = true;
          }
          if (!has) {
            const others = typeMethods.get(metadata.abstract.name) ?? [];
            others.push({ name: m, func: method });
            typeMethods.set(metadata.abstract.name, others);
          }
        });
    });
    return { queries, mutations, subscriptions, typeMethods };
  }

  /**
   * Simplify resolver function
   *
   * Here could make more features
   */
  private makeResolver(func: Function) {
    return (source: any, args: any, context: any, info: any) => {
      return func && func(args, context, { source, context, info });
    };
  }

  private buildResolvers(): any {
    const typeObject: any = { };
    this.graphqlMethod.typeMethods.forEach((values, key) => {
      typeObject[key] = values?.reduce((r: any, v: any) => { r[v.name] = v; return r;}, { });
    });
    return {
      Query: this.graphqlMethod.queries?.reduce((r: any, v: GFunction) => { r[v.name] = v.func; return r;}, { }),
      Mutation: this.graphqlMethod.mutations?.reduce((r: any, v: GFunction) => { r[v.name] = v.func; return r;}, { }),
      Subscription: this.graphqlMethod.subscriptions?.reduce((r: any, v: GFunction) => { r[v.name] = v.func; return r;}, { }),
      ...typeObject
    };
  }

  /**
   * Render graphql ui
   */
  renderGraphiQL(options: any) {
    // Ensures string values are safe to be used within a <script> tag.
    function safeSerialize(data: any) {
      return data != null
        ? JSON.stringify(data).replace(/\//g, '\\/')
        : 'undefined';
    }

    const queryString = options.query;
    const variablesString = options.variables != null ? JSON.stringify(options.variables, null, 2) : null;
    const resultString = options.result != null ? JSON.stringify(options.result, null, 2) : null;
    const operationName = options.operationName;

    // TODO: Add npm module js/css for script/style (without cdn)
    return `<!--
      The request to this GraphQL server provided the header "Accept: text/html"
      and as a result has been presented GraphiQL - an in-browser IDE for
      exploring GraphQL.
      If you wish to receive JSON, provide the header "Accept: application/json" or
      add "&raw" to the end of the URL within a browser.
      -->
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>GraphiQL</title>
        <meta name="robots" content="noindex" />
        <meta name="referrer" content="origin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            margin: 0;
            overflow: hidden;
          }
          #graphiql {
            height: 100vh;
          }
        </style>
        <script
          crossorigin
          src="https://unpkg.com/react@16/umd/react.development.js"
        ></script>
        <script
          crossorigin
          src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"
        ></script>

        <!--
          These two files can be found in the npm module, however you may wish to
          copy them directly into your environment, or perhaps include them in your
          favored resource bundler.
         -->
        <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
      </head>
      <body>
        <div id="graphiql">Loading...</div>
        <script>
          // Collect the URL parameters
          var parameters = {};
          window.location.search.substr(1).split('&').forEach(function (entry) {
            var eq = entry.indexOf('=');
            if (eq >= 0) {
              parameters[decodeURIComponent(entry.slice(0, eq))] =
                decodeURIComponent(entry.slice(eq + 1));
            }
          });
          // Produce a Location query string from a parameter object.
          function locationQuery(params) {
            return '?' + Object.keys(params).filter(function (key) {
              return Boolean(params[key]);
            }).map(function (key) {
              return encodeURIComponent(key) + '=' +
                encodeURIComponent(params[key]);
            }).join('&');
          }
          // Derive a fetch URL from the current URL, sans the GraphQL parameters.
          var graphqlParamNames = {
            query: true,
            variables: true,
            operationName: true
          };
          var otherParams = {};
          for (var k in parameters) {
            if (parameters.hasOwnProperty(k) && graphqlParamNames[k] !== true) {
              otherParams[k] = parameters[k];
            }
          }
          var fetchURL = locationQuery(otherParams);
          // Defines a GraphQL fetcher using the fetch API.
          function graphQLFetcher(graphQLParams) {
            return fetch(fetchURL, {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(graphQLParams),
              credentials: 'include',
            }).then(function (response) {
              return response.json();
            });
          }
          // When the query and variables string is edited, update the URL bar so
          // that it can be easily shared.
          function onEditQuery(newQuery) {
            parameters.query = newQuery;
            updateURL();
          }
          function onEditVariables(newVariables) {
            parameters.variables = newVariables;
            updateURL();
          }
          function onEditOperationName(newOperationName) {
            parameters.operationName = newOperationName;
            updateURL();
          }
          function updateURL() {
            history.replaceState(null, null, locationQuery(parameters));
          }
          // Render <GraphiQL /> into the body.
          ReactDOM.render(
            React.createElement(GraphiQL, {
              fetcher: graphQLFetcher,
              onEditQuery: onEditQuery,
              onEditVariables: onEditVariables,
              onEditOperationName: onEditOperationName,
              query: ${safeSerialize(queryString)},
              response: ${safeSerialize(resultString)},
              variables: ${safeSerialize(variablesString)},
              operationName: ${safeSerialize(operationName)},
            }),
            document.getElementById('graphiql')
          );
        </script>
      </body>
      </html>
    `;
  }
}

declare type GraphQLMethod = {
  queries: GFunction[];
  mutations: GFunction[];
  subscriptions: GFunction[];
  typeMethods: Map<string, GFunction[]>;
}

declare type GFunction = {
  name: string;
  func: Function;
}
