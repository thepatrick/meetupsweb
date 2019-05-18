const { AdminUI } = require('@keystone-alpha/admin-ui')
const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone')
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose')

const { Event, Group, Talk, User } = require('./schema')

const keystone = new Keystone({
  name: 'meetupsweb',
  adapter: new MongooseAdapter()
})

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User'
})

keystone.createList('User', User)
keystone.createList('Group', Group)
keystone.createList('Event', Event)
keystone.createList('Talk', Talk)

const admin = new AdminUI(keystone, {
  authStrategy,
  pages: [
    {
      label: 'Videos',
      children: ['Group', 'Event', 'Talk']
    },
    {
      label: 'People',
      children: ['User']
    }
  ]
})

module.exports = {
  keystone,
  admin
}
