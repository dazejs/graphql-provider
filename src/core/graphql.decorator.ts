
export const GRAPHQL_TYPE = Symbol('DAZE#GRAPHQL_TYPE');
export const GRAPHQL_TYPE_OBJ = class GraphQLTypeObj { };
export const GRAPHQL_QUERY_TYPE = Symbol('DAZE#GRAPHQL_QUERY_TYPE');
export const GRAPHQL_MUTATION_TYPE = Symbol('DAZE#GRAPHQL_MUTATION_TYPE');
export const GRAPHQL_SUBSCRIPTION_TYPE = Symbol('DAZE#GRAPHQL_SUBSCRIPTION_TYPE');

export function GraphQL(): ClassDecorator {
  return function (constructor: Function) {
    const graphQLTypes: Map<Function, GraphQLMetadata> = Reflect.getMetadata(GRAPHQL_TYPE, GRAPHQL_TYPE_OBJ) ?? new Map();
    if (!graphQLTypes.has(constructor)) {
      graphQLTypes.set(constructor, { abstract: constructor });
    }
    Reflect.defineMetadata(GRAPHQL_TYPE, graphQLTypes, GRAPHQL_TYPE_OBJ);
  };
}

export interface GraphQLMetadata {
  abstract: Function;
}

export function Query(): MethodDecorator {
  return function (target: object, name: string | symbol) {
    const queryTypes = Reflect.getMetadata(GRAPHQL_QUERY_TYPE, target.constructor) ?? new Map();
    if (!queryTypes.has(name)) {
      queryTypes.set(name, true);
    }
    Reflect.defineMetadata(GRAPHQL_QUERY_TYPE, queryTypes, target.constructor);
  };
}

export function Mutation(): MethodDecorator {
  return function (target: object, name: string | symbol) {
    const mutationTypes = Reflect.getMetadata(GRAPHQL_MUTATION_TYPE, target.constructor) ?? new Map();
    if (!mutationTypes.has(name)) {
      mutationTypes.set(name, true);
    }
    Reflect.defineMetadata(GRAPHQL_MUTATION_TYPE, mutationTypes, target.constructor);
  };
}

export function Subscription(): MethodDecorator {
  return function (target: object, name: string | symbol) {
    const subscriptionTypes = Reflect.getMetadata(GRAPHQL_SUBSCRIPTION_TYPE, target.constructor) ?? new Map();
    if (!subscriptionTypes.has(name)) {
      subscriptionTypes.set(name, true);
    }
    Reflect.defineMetadata(GRAPHQL_SUBSCRIPTION_TYPE, subscriptionTypes, target.constructor);
  };
}
