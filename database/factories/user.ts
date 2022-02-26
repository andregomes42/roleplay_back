import User  from 'App/Models/User';
import Factory from '@ioc:Adonis/Lucid/Factory'
import { DungeonFactory } from './dungeon';
const { faker } = require('@faker-js/faker');

export const UserFactory = Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        username: faker.name.findName(),
        password: faker.internet.password(),
        avatar: faker.internet.url()
    }
})
    .relation('dungeons', () => DungeonFactory)
    .state('email', (user) => user.email = faker.name.findName())
    .state('avatar', (user) => user.avatar = faker.word.verb())
    .state('username', (user) => user.username = faker.name.middleName())
    .state('password', (user) => user.password = faker.name.middleName())
    .build()
