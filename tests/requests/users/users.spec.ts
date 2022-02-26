import Hash from '@ioc:Adonis/Core/Hash'
import test from 'japa'
const { faker } = require('@faker-js/faker');
import Database from '@ioc:Adonis/Lucid/Database'
import supertest from 'supertest'
import { UserFactory } from 'Database/factories/user'

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let makeUser
let token
let password

test.group('Users', (group) => {
    group.beforeEach(async () => {
        password = faker.internet.password()
        await Database.beginGlobalTransaction()
        user = await UserFactory.merge({ password }).create()

        const { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        token = body.token.token
    })  

    test('it POST /users', async (assert) => {
        makeUser = await UserFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users')
            .send(makeUser).expect(201)

        assert.equal(body.user.username, makeUser.username)
        assert.equal(body.user.email, makeUser.email)
    })

    test('it return 409 when email is arelady in use', async(assert) => {
        makeUser = await UserFactory.merge({ email: user.email }).makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users')
            .send(makeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 409 when username is arelady in use', async(assert) => {
        makeUser = await UserFactory.merge({ username: user.username }).makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users')
            .send(makeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it returns 422 when no body is provided', async(assert) => {
        const { body } = await supertest(BASE_URL).post('/users')
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async(assert) => {
        makeUser = await UserFactory.apply('email').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users')
            .send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async(assert) => {
        makeUser = await UserFactory.apply('avatar').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users')
            .send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async(assert) => {
        makeUser = await UserFactory.apply('username').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users')
            .send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async(assert) => {
        makeUser = await UserFactory.apply('password').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users')
            .send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it PUT /users/:user', async (assert) => {
        makeUser = await UserFactory.makeStubbed()
        await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(makeUser).expect(200)
        await user.refresh()

        assert.isTrue(await Hash.verify(user.password, makeUser.password))
        assert.equal(user.email, makeUser.email)
        assert.equal(user.avatar, makeUser.avatar)
        assert.equal(user.username, makeUser.username)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
       const { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .send(makeUser).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 403 when user has no permission to the action', async (assert) => {
        makeUser = await UserFactory.makeStubbed()
        const secondUser = await UserFactory.create()
        const { body } = await supertest(BASE_URL).put(`/users/${ secondUser.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(makeUser).expect(403)

        assert.equal(body.status, 403)
        assert.equal(body.code, 'FORBIDDEN_ACCESS')
    })

    test('it return 409 when email is already in use', async (assert) => {
        const secondUser = await UserFactory.create()
        makeUser = await UserFactory.merge({ email: secondUser.email }).makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(makeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 409 when username is already in use', async (assert) => {
        const secondUser = await UserFactory.create()
        makeUser = await UserFactory.merge({ username: secondUser.username }).makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(makeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when no body is provided', async (assert) => {
        const { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async (assert) => {
        makeUser = await UserFactory.apply('email').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async (assert) => {
        makeUser = await UserFactory.apply('avatar').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async (assert) => {
        makeUser = await UserFactory.apply('username').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async (assert) => {
        makeUser = await UserFactory.apply('password').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})
