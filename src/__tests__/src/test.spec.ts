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
});
