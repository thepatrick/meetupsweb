const {
  Relationship,
  Select,
  Text,
  Password,
  Checkbox,
  DateTime
} = require('@keystone-alpha/fields')

const access = {
  userIsAdmin: ({ authentication: { item: user } }) => user && !!user.isAdmin,
  userIsLoggedIn: ({ authentication: { item: user } }) => !!user,
  userIsAdminOrPath: path => ({ existingItem: item, authentication: { item: user } }) => {
    if (!user) {
      return false
    }
    return user.isAdmin || user.id === item[path]
  },
  user: (fn) => ({ existingItem, authentication: { item: user } }) => fn(user, existingItem)

}

access.userIsAdminOrSelf = access.user((user, item) => (user && (user.isAdmin || user.id === item.id)))

access.readWriteLoggedIn = {
  create: access.userIsLoggedIn,
  read: access.userIsLoggedIn,
  update: access.userIsLoggedIn,
  delete: access.userIsLoggedIn
}

exports.User = {
  schemaDoc: 'MeetupsWeb users',
  access: {
    // Only auth'd users can read anything, only admin users can see deactivated users
    read: access.user(u => {
      if (!u) {
        return false
      }
      if (u.isAdmin) {
        return true
      }
      return {
        state_not: 'deactivated',
        isPublic_not: false
      }
    }),
    update: access.userIsAdmin,
    delete: access.userIsAdmin
  },
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
      isRequired: true,
      access: access.userIsAdminOrSelf

    },
    password: {
      type: Password,
      access: {
        read: access.userIsAdminOrSelf,
        update: access.userIsAdminOrSelf
      },
      isRequired: true
    },
    isAdmin: { type: Checkbox, defaultValue: false },
    isPublic: { type: Checkbox, defaultValue: false },
    state: {
      type: Select,
      options: ['active', 'deactivated'],
      defaultValue: 'active'
    }
  }
}

exports.Group = {
  schemaDoc: 'A list of Groups that have events',
  access: access.readWriteLoggedIn,
  fields: {
    name: { type: Text, schemaDoc: 'This is the name of the group' },
    events: { type: Relationship, ref: 'Event.group', many: true }
  }
}

exports.Event = {
  schemaDoc: 'A list of the Events held by a Group',
  access: access.readWriteLoggedIn,
  fields: {
    name: { type: Text, schemaDoc: 'Title of this event', isRequired: true },
    group: { type: Relationship, ref: 'Group.events', isRequired: true },
    talks: { type: Relationship, ref: 'Talk.event', many: true },
    startTime: { type: DateTime, isRequired: true }

  }
}

exports.Talk = {
  schemaDoc: 'An Event is made up of many Talks',
  access: access.readWriteLoggedIn,
  fields: {
    name: { type: Text, schemaDoc: 'Title of this talk' },
    event: { type: Relationship, ref: 'Event.talks', isRequired: true },
    encodeProfile: {
      type: Select,
      options: ['hdv_720_25p', 'atsc_1080p_25'],
      defaultValue: 'atsc_1080p_25',
      schemaDoc: 'What profile should we encode this talk with (typically you want 1080p)'
    },
    encodeFps: {
      type: Select,
      options: 'fps25, fps30, fps50, fps60',
      defaultValue: 'fps25',
      schemaDoc: 'What FPS was this talk recorded at (typically 25 in PAL countries, 30 in NTSC countries)'
    }
  }
}
