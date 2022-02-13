import User  from 'App/Models/User';
import Factory from '@ioc:Adonis/Lucid/Factory'
const { faker } = require('@faker-js/faker');

export const UserFactory = Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        username: faker.name.findName(),
        password: faker.internet.password(),
        avatar: faker.internet.url()
    }
})
    .state('email', (user) => user.email = faker.name.findName())
    .state('username', (user) => user.username = faker.name.middleName())
    .state('password', (user) => user.password = faker.name.middleName()).build()