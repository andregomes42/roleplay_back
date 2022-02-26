import Group  from 'App/Models/Group';
import Factory from '@ioc:Adonis/Lucid/Factory'
const { faker } = require('@faker-js/faker');

export const GroupFactory = Factory.define(Group, ({ faker }) => {
    return {
        name: faker.company.companyName(),
        chronic: faker.lorem.paragraphs(),
        schedule: faker.date.weekday(),
        location: faker.address.streetAddress(),
        description: faker.commerce.productDescription()
    }
})
    .state('name', (group) => group.name = faker.name.middleName())
    .state('chronic', (group) => group.chronic = faker.name.middleName())
    .state('schedule', (group) => group.schedule = faker.date.future())
    .state('location', (group) => group.location = faker.address.streetPrefix())
    .state('description', (group) => group.description = faker.name.middleName())
    .build()
