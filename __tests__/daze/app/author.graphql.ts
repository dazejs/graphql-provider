import { inject } from '@dazejs/framework/dist';
import { graphQL, mutation, query } from '../../../src';
import AuthorService, { Author } from './service/author.service';
import BookService, { Book } from './service/book.service';

@graphQL('Author')
export default class AuthorGraphql {

  @inject()
  private authorService: AuthorService;
  @inject()
  private bookService: BookService;

  /**
   * create a author
   */
  @mutation()
  createAuthor(author: Author): Author {
    return this.authorService.createAuthor(author);
  }

  /**
   * query all authors
   */
  @query()
  findAllAuthors(): Array<Author> {
    return this.authorService.findAllAuthors();
  }

  /**
   * find author by id
   */
  @query()
  findAuthorById({ id }: Author): Author | undefined {
    return this.authorService.findAuthorById(id);
  }

  /**
   * update a author with book ids
   */
  @mutation()
  updateAuthorBooks({id, bookIds}: Author): Author | undefined {
    return this.authorService.updateAuthor(id, bookIds);
  }


  // Author 中获取 books 数据
  books(_: any, {source}: any): Array<Book | undefined> {
    const author = source as Author;
    return author.bookIds.map((id) => this.bookService.findBookById(id));
  }

}
