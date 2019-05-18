const keystone = require('@keystone-alpha/core')

const PORT = process.env.PORT || 3000
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meetupsweb'

const initialData = {
  User: [
    {
      name: 'Admin User',
      email: 'admin@twopats.live',
      password: 'password',
      isAdmin: true,
      isPublic: false,
      state: 'active'
    }
  ]
}

async function main () {
  const { keystone: keystoneApp } = await keystone.prepare({ port: PORT })
  await keystoneApp.connect(mongoUri)

  console.log('Dropping databases...')
  Object.values(keystoneApp.adapters).forEach(async adapter => {
    await adapter.dropDatabase()
  })

  await keystoneApp.createItems(initialData)

  console.log('Initial data set')
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
