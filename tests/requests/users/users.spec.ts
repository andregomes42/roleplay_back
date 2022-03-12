import Hash from '@ioc:Adonis/Core/Hash'
import test from 'japa'
const { faker } = require('@faker-js/faker');
import Database from '@ioc:Adonis/Lucid/Database'
import supertest from 'supertest'
import { UserFactory } from 'Database/factories/user'

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let payload
let token
let password

test.group('Users', (group) => {
    group.beforeEach(async () => {
        password = faker.internet.password()
        await Database.beginGlobalTransaction()
        user = await UserFactory.merge({ password }).create()

        let { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        token = body.token.token
    })  

    test('it POST /users', async (assert) => {
        user = await UserFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(user).expect(201)

        assert.equal(body.username, user.username)
        assert.equal(body.email, user.email)
    })

    test('it return 409 when email is arelady in use', async(assert) => {
        user = await UserFactory.merge({ email: user.email }).makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(user).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 409 when username is arelady in use', async(assert) => {
        user = await UserFactory.merge({ username: user.username }).makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(user).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it returns 422 when no body is provided', async(assert) => {
        let { body } = await supertest(BASE_URL).post('/users')
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async(assert) => {
        user = await UserFactory.apply('email').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async(assert) => {
        user = await UserFactory.apply('avatar').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async(assert) => {
        user = await UserFactory.apply('username').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async(assert) => {
        user = await UserFactory.apply('password').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it PUT /users/:user', async (assert) => {
        payload = await UserFactory.makeStubbed()
        await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(200)
        await user.refresh()

        assert.isTrue(await Hash.verify(user.password, payload.password))
        assert.equal(user.email, payload.email)
        assert.equal(user.avatar, payload.avatar)
        assert.equal(user.username, payload.username)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
       let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .send(user).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 403 when user has no permission to the action', async (assert) => {
        payload = await UserFactory.makeStubbed()
        let user = await UserFactory.create()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(403)

        assert.equal(body.status, 403)
        assert.equal(body.code, 'FORBIDDEN_ACCESS')
    })

    test('it return 409 when email is already in use', async (assert) => {
        let sUser = await UserFactory.create()
        payload = await UserFactory.merge({ email: sUser.email }).makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 409 when username is already in use', async (assert) => {
        let sUser = await UserFactory.create()
        payload = await UserFactory.merge({ username: sUser.username }).makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when no body is provided', async (assert) => {
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async (assert) => {
        user = await UserFactory.apply('email').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async (assert) => {
        user = await UserFactory.apply('avatar').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async (assert) => {
        user = await UserFactory.apply('username').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async (assert) => {
        user = await UserFactory.apply('password').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    group.afterEach(async () => {
        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ token }`)
        await Database.rollbackGlobalTransaction()
    })
})
