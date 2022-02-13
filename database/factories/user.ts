import User  from 'App/Models/User';
import Factory from '@ioc:Adonis/Lucid/Factory'

export const UserFactory = Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        username: faker.name.findName(),
        password: faker.internet.password(),
        avatar: faker.internet.url()
    }
}).build()