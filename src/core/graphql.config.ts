
export class GraphqlConfig {

  public readonly enable: boolean;
  public readonly uri: string;
  public readonly graphiql: boolean;
  public readonly graphiqlUri: string;

  constructor(enable: boolean, uri: string, graphiql: boolean, graphiqlUri: string) {
    this.enable = enable;
    this.uri = uri;
    this.graphiql = graphiql;
    this.graphiqlUri = graphiqlUri;
  }

  static build(conf: any): GraphqlConfig {
    const enable = conf?.enable || true;
    const uri = conf?.uri || '/graphql';
    const graphiql = conf?.graphiql || false;
    const graphiqlUri = conf?.graphiqlUri || '/graphiql';
    return new GraphqlConfig(enable, uri, graphiql, graphiqlUri);
  }
}
