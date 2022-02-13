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
        assert.equal(body.user.email, user.email)
    })

    test('it return 409 when email is arelady in use', async(assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.merge({ email: user.email }).makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(fakeUser).expect(409)

        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 409)
    })

    test('it return 409 when username is arelady in use', async(assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.merge({ username: user.username }).makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(fakeUser).expect(409)

        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 409)
    })

    test('it return 422 when provides an invalid email', async(assert) => {
        const user = await UserFactory.apply('email').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(422)

        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 422)
    })

    test('it return 422 when provides an invalid username', async(assert) => {
        const user = await UserFactory.apply('username').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(422)

        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 422)
    })

    test('it return 422 when provides an invalid password', async(assert) => {
        const user = await UserFactory.apply('password').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(422)

        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 422)
    })
})
