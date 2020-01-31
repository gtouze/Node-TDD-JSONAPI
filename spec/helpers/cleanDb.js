const cleanDb = async (db) => {
  try {
    await db.Author.deleteMany({});
    await db.Post.deleteMany({});
  } catch (e) {
  }
}
module.exports = cleanDb
