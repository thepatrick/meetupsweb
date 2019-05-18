const keystone = require('@keystone-alpha/core')
const path = require('path')
const PORT = process.env.PORT || 3000

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meetupsweb'

async function main () {
  const { server, keystone: keystoneApp } = await keystone.prepare({ port: PORT })
  await keystoneApp.connect(mongoUri)

  const users = await keystoneApp.lists.User.adapter.findAll()
  if (!users.length) {
    throw new Error('You have no users, you probably meant to run `yarn database:reset` first')
  }

  // In this project, we attach a single route handler for `/public` to serve
  // our app
  server.app.use(server.express.static(path.join(__dirname, 'public')))
  // Finally, we must start the server so we can access the Admin UI and
  // GraphQL API
  return server.start()
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
