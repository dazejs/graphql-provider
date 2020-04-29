import { Service, Multiton } from '@dazejs/framework/dist';

@Multiton()
export default class AuthorService extends Service {

  private authors: Map<number, Author> = new Map();

  createAuthor(author: Author): Author {
    author.id = Math.floor(Math.random() * 10000) + 1;
    this.authors.set(author.id, author);
    return author;
  }

  findAllAuthors(): Array<Author> {
    return [ ...this.authors.values() ];
  }

  findAuthorById(id: number): Author | undefined {
    return this.authors.get(id);
  }

  updateAuthor(id: number, bookIds: Array<number>) {
    const author = this.authors.get(id);
    if (author) {
      author.bookIds = bookIds;
      this.authors.set(id, author);
    }
    return author;
  }

}

export interface Author {
  id: number;
  name: string;
  bookIds: Array<number>;
}