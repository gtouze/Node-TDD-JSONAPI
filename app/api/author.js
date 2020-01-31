async function mongoToAPI(datas)
{
  let result = {
    data: [],
    included: []
  }
  let postsArray = await Promise.all(datas.map((data) => {return data.getPosts();}))
  result.data = datas.map((author) => {
    return {
              id: author._id.toString(), type: "author", attributes: {firstName: author.firstName, lastName: author.lastName},
              relationships: {posts: []}
            }
  })

  return result;
  // result.data = await authors.map(async () => {

  // })
  // authors.forEach( async (author) => {
  //   let posts = {};
  //   (await author.getPosts()).forEach((post) => {
  //     posts[post._id]= {id: post._id, type: "post"};
  //     result.included.push({type: "post", id: post._id, attributes: {title: post.title, content: post.content}})
  //   });
  //   result.data.push(
  //       {
  //         id: author._id.toString(), type: "author", attributes: {firstName: author.firstName, lastName: author.lastName},
  //         relationships: {posts: [posts]}
  //       }
  //   )
  // })
}

module.exports = (app, db) => {
  app.post('/author', async (req, res) => {
    await db.Author.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    }).then((result) => res.json(result))
  })

  app.get('/authors', async (req, res) => {
    await db.Author.findAll({attributes: ['_id', 'firstName', 'lastName']}).then((authors) => {
      mongoToAPI(authors).then((result) => {
        res.type('application/vnd.api+json')
        return res.json(result)
      }).catch((err) => {
        res.json(err);
      })
    })
  })
}
