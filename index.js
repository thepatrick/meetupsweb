const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone')
const { AdminUI } = require('@keystone-alpha/admin-ui')
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose')
const { Relationship, Select, Text, Password, Checkbox } = require('@keystone-alpha/fields')

// The core `keystone` instance is always required.
// Here you can setup the database adapter, set the name used throughout the
// application (Admin UI, database name, etc), and other core config options.
const keystone = new Keystone({
  name: 'meetupsweb',
  adapter: new MongooseAdapter()
})

keystone.createList('User', {
  schemaDoc: 'MeetupsWeb users',
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      access: ({ existingItem, authentication }) => (
        (authentication.item && (
          authentication.item.isAdmin || existingItem.id === authentication.item.id
        )) || false
      )
    },
    password: {
      type: Password,
      access: {
        // 3. Only admins can see if a password is set. No-one can read their own or other user's passwords.
        read: ({ authentication }) => (authentication.item && authentication.item.isAdmin) || false,
        // 4. Only authenticated users can update their own password. Admins can update anyone's password.
        update: ({ existingItem, authentication }) => (
          (authentication.item && (authentication.item.isAdmin ||
          existingItem.id === authentication.item.id)) || false
        )
      }
    },
    isAdmin: { type: Checkbox, defaultValue: false },
    isPublic: { type: Checkbox, defaultValue: false },
    state: {
      type: Select,
      options: ['active', 'deactivated'],
      defaultValue: 'active'
    }
  },
  access: {
    // Only auth'd users can read anything, only admin users can see deactivated users
    read: ({ authentication: { item } }) => {
      const resp = {}
      if (!item) {
        resp.isPublic_not = false
      }
      if (!item || !item.isAdmin) {
        resp.state_not = 'deactivated'
      }
      return resp
    }
  }
})

keystone.createList('Group', {
  schemaDoc: 'A list of Groups that have events',
  fields: {
    name: { type: Text, schemaDoc: 'This is the name of the group' },
    events: { type: Relationship, ref: 'Event', many: true }
  }
})

keystone.createList('Event', {
  schemaDoc: 'A list of the Events held by a Group',
  fields: {
    name: { type: Text, schemaDoc: 'Title of this event' },
    group: { type: Relationship, ref: 'Group.events' },
    talks: { type: Relationship, ref: 'Talk', many: true }
  }
})

keystone.createList('Talk', {
  schemaDoc: 'An Event is made up of many Talks',
  fields: {
    name: { type: Text, schemaDoc: 'Title of this talk' },
    event: { type: Relationship, ref: 'Event.talks' }
  }
})

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User'
  // config: {
  //   identityField: 'username', // default: 'email'
  //   secretField: 'password' // default: 'password'
  // }
})

// Setup the optional Admin UI
// If no admin is created, you will still have a fully functioning GraphQL API.
const admin = new AdminUI(keystone, { authStrategy })

module.exports = {
  // You must export your 'keystone' instance which will be used to setup
  // a database, and associated GraphQL APIs.
  keystone,

  // Optionally export the 'admin' instance, which will generate the Admin UI
  // based on the lists and fields you've setup.
  admin
}
