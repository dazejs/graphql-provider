import { Inject } from '@dazejs/framework/dist';
import { GraphQL, Mutation, Query } from '../../../index';
import AuthorService, { Author } from './service/author.service';
import BookService, { Book } from './service/book.service';

@GraphQL('Author')
export default class AuthorGraphql {

  @Inject(AuthorService)
  private authorService: AuthorService;
  @Inject(BookService)
  private bookService: BookService;

  /**
   * create a author
   */
  @Mutation()
  createAuthor(author: Author): Author {
    return this.authorService.createAuthor(author);
  }

  /**
   * query all authors
   */
  @Query()
  findAllAuthors(): Array<Author> {
    return this.authorService.findAllAuthors();
  }

  /**
   * find author by id
   */
  @Query()
  findAuthorById({ id }: Author): Author | undefined {
    return this.authorService.findAuthorById(id);
  }

  /**
   * update a
   */
  @Mutation()
  updateAuthorBooks({id, bookIds}: Author): Author | undefined {
    return this.authorService.updateAuthor(id, bookIds);
  }


  // Author 中获取 books 数据
  books(_: any, {source}: any): Array<Book | undefined> {
    const author = source as Author;
    return author.bookIds.map((id) => this.bookService.findBookById(id));
  }

}
