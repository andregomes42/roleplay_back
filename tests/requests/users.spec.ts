import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/user'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST }:${process.env.PORT}/api/v1`

test.group('Users', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })

    test('it POST /users', async (assert) => {
        const user = await UserFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(201)

        assert.equal(body.user.username, user.username)
    })

    test('it return 409 when email is arelady in use', async(assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.merge({ email: user.email }).makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(fakeUser).expect(409)
    })
})
