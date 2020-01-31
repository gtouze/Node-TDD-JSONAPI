
const Author = require('../../modelsMongo/author.js')

async function mongoToAPI(datas, include) {
    let result = {
        data: [],
        included: []
    }
    let authorsId = [];
    result.data = datas.map((post) => {
        authorsId.push(post.AuthorId);
        return {
            id: post._id.toString(), type: "post", attributes: {title: post.title, content: post.content},
            relationships: {
                author: {
                    data: {id: post.AuthorId.toString(), type: "author"}
                }
            }
        }
    })
    for(let i=0; i < authorsId.length;  ++i) {
        let author = Author.findById(authorsId[i]);
        result.included.push({
            type: "author",
            id: authorsId[i],
            attributes: {
                firstName: author.firstName,
                lastName: author.lastName
            }
        });
    }

    return result;
}
module.exports = (app, db) => {
    app.post('/post', async (req, res) => {
        await db.Post.create({
            title: req.body.title,
            content: req.body.content,
            AuthorId: req.body.AuthorId,
        }).then((result) => {
            let mongoResult = mongoToAPI(result)
            res.json(mongoResult)
        })
    })
    app.get('/posts', async (req, res) => {
        let include = req.query.include;
        await db.Post.findAll({attributes: ['_id', 'title', 'content', 'AuthorId']}).then((posts) => {
            mongoToAPI(posts).then((result) => {
                res.type('application/vnd.api+json')
                return res.json(result)
            }).catch((err) => {
                res.json(err);
            })
        })
    })
}
