
export class GraphqlConfig {

  public readonly enable: boolean;
  public readonly uri: string;
  public readonly graphiql: boolean;

  constructor(enable: boolean, uri: string, graphiql: boolean) {
    this.enable = enable;
    this.uri = uri;
    this.graphiql = graphiql;
  }

  static build(conf: any): GraphqlConfig {
    const enable = conf?.enable || true;
    const uri = conf?.uri || '/graphql';
    const graphiql = conf?.graphiql || false;
    return new GraphqlConfig(enable, uri, graphiql);
  }
}
