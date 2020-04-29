import path from 'path';
import request from 'supertest';
import { Application } from "@dazejs/framework/dist";

const app = new Application(path.resolve(__dirname, '../daze'));

beforeAll(() => app.run());
afterAll(() => app.close());

describe('test book', () => {

  it('test create book', async () => {
    const res = await request(app._server).post('/graphql?query=mutation { createBook(name: "GraphQL", pageCount: 10) { id, name } }');
    const book = await res.body.data.createBook;
    expect(book).toBeTruthy();
    const res2 = await request(app._server).post(`/graphql?query={ findBookById(id: ${book.id}) { id, name } }`);
    expect(res2.body.data.findBookById).toEqual(book);
  });

  it('test update book', async () => {
    const res = await request(app._server).post('/graphql?query=mutation { createBook(name: "GraphQL", pageCount: 10) { id, name } }');
    const book = await res.body.data.createBook;
    expect(book).toBeTruthy();
    // update
    await request(app._server).post(`/graphql?query=mutation { updateBook(id: ${book.id}, name: "GraphQL2") { id, name } }`);
    // find
    const res2 = await request(app._server).post(`/graphql?query={ findBookById(id: ${book.id}) { id, name } }`);
    expect(res2.body.data.findBookById.name).toEqual("GraphQL2");
  });
});
