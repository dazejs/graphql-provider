import { service, singleton } from '@dazejs/framework/dist';

@singleton
@service('bookService')
export default class BookService {

  private books: Map<number, Book> = new Map();

  createBook(book: Book): Book {
    book.id = Math.floor(Math.random() * 10000) + 1;
    this.books.set(book.id, book);
    return book;
  }

  updateBook(id: number, name: string): Book | undefined {
    const book = this.findBookById(id);
    if (book && name) {
      book.name = name;
    }
    return book;
  }

  findAllBooks(): Array<Book> {
    return [ ...this.books.values() ];
  }

  findBookById(id: number): Book | undefined {
    return this.books.get(id);
  }
}

export interface Book {
  id: number;
  name: string;
  pageCount: number;
  price: number;
}
