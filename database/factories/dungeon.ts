import Dungeon  from 'App/Models/Dungeon';
import Factory from '@ioc:Adonis/Lucid/Factory'
import { UserFactory } from './user';
const { faker } = require('@faker-js/faker');

export const DungeonFactory = Factory.define(Dungeon, ({ faker }) => {
    return {
        name: faker.company.companyName(),
        chronic: faker.lorem.sentence(),
        schedule: faker.date.weekday(),
        location: faker.internet.url(),
        description: faker.lorem.paragraph()
    }
})
    .relation('players', () => UserFactory)
    .relation('master', () => UserFactory)
    .state('name', (dungeon) => dungeon.name = faker.name.middleName())
    .state('chronic', (dungeon) => dungeon.chronic = faker.name.middleName())
    .state('schedule', (dungeon) => dungeon.schedule = faker.address.streetPrefix())
    .state('location', (dungeon) => dungeon.location = faker.address.streetPrefix())
    .state('description', (dungeon) => dungeon.description = faker.name.middleName())
    .build()
