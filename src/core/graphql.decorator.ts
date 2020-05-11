
export const GRAPHQL_TYPE = Symbol('DAZE#GRAPHQL_TYPE');
export const GRAPHQL_TYPE_OBJ = class GraphQLTypeObj { };
export const GRAPHQL_QUERY_TYPE = Symbol('DAZE#GRAPHQL_QUERY_TYPE');
export const GRAPHQL_MUTATION_TYPE = Symbol('DAZE#GRAPHQL_MUTATION_TYPE');
export const GRAPHQL_SUBSCRIPTION_TYPE = Symbol('DAZE#GRAPHQL_SUBSCRIPTION_TYPE');
export const GRAPHQL_SCALAR_TYPE = Symbol('DAZE#GRAPHQL_SCALAR_TYPE');

export interface GraphQLMetadata {
  abstract: Function;
  name: string;
}

export function GraphQL(alias?: string): ClassDecorator {
  return function (constructor: Function) {
    const graphQLTypes: Map<Function, GraphQLMetadata> = Reflect.getMetadata(GRAPHQL_TYPE, GRAPHQL_TYPE_OBJ) ?? new Map();
    if (!graphQLTypes.has(constructor)) {
      graphQLTypes.set(constructor, { abstract: constructor, name: alias ?? constructor.name });
    }
    Reflect.defineMetadata(GRAPHQL_TYPE, graphQLTypes, GRAPHQL_TYPE_OBJ);
  };
}
export function graphQL(alias?: string) {
  return GraphQL(alias);
}

export function Query(alias?: string): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const queryTypes: Map<string, GraphQLMetadata> = Reflect.getMetadata(GRAPHQL_QUERY_TYPE, target.constructor) ?? new Map();
    const name = propertyKey.toString();
    if (!queryTypes.has(name)) {
      queryTypes.set(name, { abstract: target.constructor, name: alias ?? name });
    }
    Reflect.defineMetadata(GRAPHQL_QUERY_TYPE, queryTypes, target.constructor);
  };
}
export function query(alias?: string) {
  return Query(alias);
}

export function Mutation(alias?: string): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const mutationTypes = Reflect.getMetadata(GRAPHQL_MUTATION_TYPE, target.constructor) ?? new Map();
    const name = propertyKey.toString();
    if (!mutationTypes.has(name)) {
      mutationTypes.set(name, { abstract: target.constructor, name: alias ?? name });
    }
    Reflect.defineMetadata(GRAPHQL_MUTATION_TYPE, mutationTypes, target.constructor);
  };
}
export function mutation(alias?: string) {
  return Mutation(alias);
}

export function Subscription(alias?: string): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const subscriptionTypes = Reflect.getMetadata(GRAPHQL_SUBSCRIPTION_TYPE, target.constructor) ?? new Map();
    const name = propertyKey.toString();
    if (!subscriptionTypes.has(name)) {
      subscriptionTypes.set(name, { abstract: target.constructor, name: alias ?? name });
    }
    Reflect.defineMetadata(GRAPHQL_SUBSCRIPTION_TYPE, subscriptionTypes, target.constructor);
  };
}
export function subscription(alias?: string) {
  return Subscription(alias);
}

export function Scalar(alias?: string): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const scalarTypes = Reflect.getMetadata(GRAPHQL_SCALAR_TYPE, target.constructor) ?? new Map();
    const name = propertyKey.toString();
    if (!scalarTypes.has(name)) {
      scalarTypes.set(name, { abstract: target.constructor, name: alias ?? name });
    }
    Reflect.defineMetadata(GRAPHQL_SCALAR_TYPE, scalarTypes, target.constructor);
  };
}
export function scalar(alias?: string) {
  return Scalar(alias);
}
