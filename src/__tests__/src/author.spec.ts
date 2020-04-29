import path from 'path';
import request from 'supertest';
import { Application } from "@dazejs/framework/dist";

const app = new Application(path.resolve(__dirname, '../daze'));

beforeAll(() => app.run());
afterAll(() => app.close());

describe('test author', () => {

  it('test create author', async () => {
    const res = await request(app._server).post('/graphql?query=mutation { createAuthor(name: "Tom") { id, name } }');
    const author = await res.body.data.createAuthor;
    expect(author).toBeTruthy();
    const res2 = await request(app._server).post(`/graphql?query={ findAuthorById(id: ${author.id}) { id, name } }`);
    expect(res2.body.data.findAuthorById).toEqual(author);
  });

  it('test update author', async () => {
    const res = await request(app._server).post('/graphql?query=mutation { createAuthor(name: "Tom2") { id, name } }');
    const author = await res.body.data.createAuthor;
    expect(author).toBeTruthy();
    // create books
    const book1Res = await request(app._server).post('/graphql?query=mutation { createBook(name: "GraphQL1", pageCount: 10) { id, name } }');
    const book1 = book1Res.body.data.createBook;
    const book2Res = await request(app._server).post('/graphql?query=mutation { createBook(name: "GraphQL2", pageCount: 10) { id, name } }');
    const book2 = book2Res.body.data.createBook;

    // update author books
    const res2 = await request(app._server).post(`/graphql?query=mutation { updateAuthorBooks(id: ${author.id}, bookIds: [${book1.id}, ${book2.id}]) { id, name, books { id, name } } }`);
    expect(res2.body.data.updateAuthorBooks).toEqual({
      id: author.id,
      name: author.name,
      books: [ book1, book2 ],
    });
  });

});
