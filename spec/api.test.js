const request = require('supertest')
const app = require('../app')
const db = require('../models');
const cleanDb = require('./helpers/cleanDb')

require('./factories/author').factory
require('./factories/post').factory
const factory = require('factory-girl').factory

beforeAll(async () => {
  await cleanDb(db)
});

afterAll(async () => {
  await cleanDb(db)
  await db.mongoose.connection.close()
});

describe('GET /', () => {
  let response;

  beforeAll(async () => {
    await cleanDb(db)
    response = await request(app).get('/');
  })

  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /author', () => {

  let response;
  let data = {};
  beforeAll(async () => {
    data.firstName = 'Seb'
    data.lastName = 'Ceb'
    console.log(`data = ${JSON.stringify(data)}`)
    response = await request(app).post('/author').send(data).set('Accept', 'application/json');
  })

  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200);
  });

  test('It should return a json with the new author', async () => {
    console.log(response.body)
    expect(response.body.firstName).toBe(data.firstName);
    expect(response.body.lastName).toBe(data.lastName);
  });
  test('It should create and retrieve a post for the selected author', async () => {
    const author = await db.Author.findById(response.body._id).exec()
    expect(author._id.toString()).toBe(response.body._id)
    expect(author.firstName).toBe(data.firstName)
    expect(author.lastName).toBe(data.lastName)
  });

});

describe('GET /authors', () => {

  let response
  let authors

  beforeAll(async () => await cleanDb(db))

  describe('when there is no author in database', () => {
    beforeAll(async () => {
      response = await request(app).get('/authors').set('Accept', 'application/json');
    })

    test('It should not retrieve any author in db', async () => {
      const authors = await db.Author.findAll()
      expect(authors.length).toBe(0);
    });
    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200);
    });
    test('It should return a json with a void array', async () => {
      let authors = response.body.data;
      expect(authors).toStrictEqual([]);
    });
  })

  describe('when there is one or more authors in database', () => {
    beforeAll(async () => {
      authors = await factory.createMany('author', 5)
      response = await request(app).get('/authors').set('Accept', 'application/json')
    })

    test('It should not retrieve any author in db', async () => {
      const authorsInDatabase = await db.Author.findAll()
      expect(authorsInDatabase.length).toBe(5)
    });
    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200)
    });
    test('It should return a json with a void array', async () => {
      expect(response.body.data.length).toBe(5)
      for (i = 0; i < 5 ; i++) {
        const expectedBody = {
          id: authors[i]._id.toString(),
          type: "author",
          attributes: {
            firstName: authors[i].firstName,
            lastName: authors[i].lastName
          },
          relationships: {posts: []}
        }
        expect(response.body.data).toContainEqual(expectedBody)
      }
    });
  })
});

describe('POST /post', () => {

  let response
  let data = {}
  let post
  let author

  beforeAll(async () => await cleanDb(db))

  describe('The author has one or multiple posts', () => {
    beforeAll(async () => {
      author = await factory.create('author')
      post = await factory.build('post')
      data.title = post.title
      data.content = post.content
      data.AuthorId = author.id
      response = await request(app).post('/post').send(data).set('Accept', 'application/json')
    })

    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200);
    });

    test('It should create and retrieve a post for the selected author', async () => {
      const postsInDatabase = await db.Post.findAll()
      expect(postsInDatabase.length).toBe(1)
      expect(postsInDatabase[0].title).toBe(post.title)
      expect(postsInDatabase[0].content).toBe(post.content)
    });

    test('It should return a json with the author\'s posts', async () => {
      expect(response.body.title).toBe(data.title);
      expect(response.body.content).toBe(data.content);
    });

    test('The post should belong to the selected authors\' posts', async () => {
      const posts = await author.getPosts()
      expect(posts.length).toBe(1)
      expect(posts[0].title).toBe(post.title)
      expect(posts[0].content).toBe(post.content)
    })
  })
});

describe('GET /post', () => {
  let response
  let posts

  beforeAll(async () => await cleanDb(db))

  describe('when there is no post in database', () => {
    beforeAll(async () => {
      response = await request(app).get('/posts', {include: "author" }).set('Accept', 'application/json');
    })

    test('It should not retrieve any post in db', async () => {
      const post = await db.Post.findAll()
      expect(post.length).toBe(0);
    });
    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200);
    });
    test('It should return a json with a void array', async () => {
      let posts = response.body.data;
      expect(posts).toStrictEqual([]);
    });
  });

  describe('when there is one or more post in database', () => {
    beforeAll(async () => {
      await cleanDb(db)
      posts = await factory.createMany('post', 5)
      response = await request(app).get('/posts').set('Accept', 'application/json')
    })

    test('It should not retrieve any post in db', async () => {
      const postsInDatabase = await db.Post.findAll()
      expect(postsInDatabase.length).toBe(5)
    });
    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200)
    });
    test('It should return a json with authors', async () => {
      let postsRcv = response.body.data;
      expect(postsRcv.length).toBe(5)
        const expectedBody2 = posts.map((post) => {
        return {
          id: post._id.toString(),
          type: "post",
          attributes: {
          title: post.title,
            content: post.content
        },
          relationships: {author: {data: {id: post.AuthorId.toString(), type: "author"}}}
        }
      })
      expectedBody2.sort(function (a, b) {
        return a.id > b.id;
      });
      postsRcv.sort(function (a, b) {
        return a.id > b.id;
      });
      expect(postsRcv).toStrictEqual(expectedBody2)
    });
  })

});
