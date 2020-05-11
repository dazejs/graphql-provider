import path from 'path';
import request from 'supertest';
import { Application } from "@dazejs/framework/dist";

const app = new Application(path.resolve(__dirname, '../daze'));

beforeAll(() => app.run());
afterAll(() => app.close());

describe('test', () => {
  it('test graphql', async () => {
    const res = await request(app._server).get('/graphql?query={ hello(str: "GraphQL!") }');
    expect(res.body.data).toEqual({
      hello: 'Hello GraphQL!',
    });
  });

  it('test graphql header', async () => {
    const testHeader = 'test-header';
    const res = await request(app._server)
      .get('/graphql?query={ hello(str: "GraphQL!") }')
      .set({ 'test-header': testHeader });
    expect(res.body.data).toEqual({
      hello: `Hello GraphQL!${testHeader}`,
    });
  });

  it('test graphiql', async () => {
    const res = await request(app._server).get('/graphiql?query={ hello(str: "GraphQL!") }');
    expect(res.text).toContain('<!DOCTYPE html>');
  });
});
