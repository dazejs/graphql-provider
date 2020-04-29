import { Inject } from '@dazejs/framework/dist';
import { GraphQL, Mutation, Query } from '../../../index';
import BookService, { Book } from './service/book.service';

@GraphQL('Book')
export default class BookGraphQL {

  @Inject(BookService)
  bookService: BookService;

  /**
   * create a book
   */
  @Mutation()
  createBook(book: Book): Book {
    return this.bookService.createBook(book);
  }

  /**
   * update a book
   */
  @Mutation()
  updateBook({ id, name }: Book) {
    return this.bookService.updateBook(id, name);
  }

  /**
   * query all books
   */
  @Query()
  findAllBooks(): Array<Book> {
    return this.bookService.findAllBooks();
  }

  /**
   * find book by id
   */
  @Query()
  findBookById({ id }: Book): Book | undefined {
    return this.bookService.findBookById(id);
  }

}
