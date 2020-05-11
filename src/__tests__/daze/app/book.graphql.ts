import { inject } from '@dazejs/framework/dist';
import { graphQL, mutation, query } from '../../../index';
import BookService, { Book } from './service/book.service';

@graphQL('Book')
export default class BookGraphQL {

  @inject()
  bookService: BookService;

  /**
   * create a book
   */
  @mutation()
  createBook(book: Book): Book {
    return this.bookService.createBook(book);
  }

  /**
   * update a book
   */
  @mutation()
  updateBook({ id, name }: Book) {
    return this.bookService.updateBook(id, name);
  }

  /**
   * query all books
   */
  @query()
  findAllBooks(): Array<Book> {
    return this.bookService.findAllBooks();
  }

  /**
   * find book by id
   */
  @query()
  findBookById({ id }: Book): Book | undefined {
    return this.bookService.findBookById(id);
  }

}
