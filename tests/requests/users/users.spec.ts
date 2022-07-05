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

    test('it GET /users', async (assert) => {
        await UserFactory.createMany(10)
        let { body } = await supertest(BASE_URL).get('/users')
            .query({ 'perPage': 10 })
            .send(user).expect(200)

        
        assert.lengthOf(body.data, 10)
        assert.isAtLeast(body.meta.total, 10)
    })
    
    test('it GET /users?search', async (assert) => {
        await UserFactory.createMany(10)
        user = await UserFactory.create()
        let { body } = await supertest(BASE_URL).get('/users')
            .query({ 'search': user.username })
            .send(user).expect(200)

        assert.isAtMost(body.meta.total, 10)
    })

    test('it POST /users', async (assert) => {
        payload = await UserFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(payload).expect(201)

        assert.equal(body.username, payload.username)
        assert.equal(body.email, payload.email)
    })

    test('it return 422 when email is arelady in use', async(assert) => {
        payload = await UserFactory.merge({ email: user.email }).makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when username is arelady in use', async(assert) => {
        payload = await UserFactory.merge({ username: user.username }).makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it returns 422 when no body is provided', async(assert) => {
        let { body } = await supertest(BASE_URL).post('/users')
            .send().expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async(assert) => {
        payload = await UserFactory.apply('email').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async(assert) => {
        payload = await UserFactory.apply('avatar').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async(assert) => {
        payload = await UserFactory.apply('username').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async(assert) => {
        payload = await UserFactory.apply('password').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/users')
            .send(payload).expect(422)

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

    test('it return 404 when user is not persisted', async (assert) => {
        payload = await UserFactory.makeStubbed()
        user = await UserFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 403 when user has no permission to the action', async (assert) => {
        payload = await UserFactory.makeStubbed()
        user = await UserFactory.create()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(403)

        assert.equal(body.status, 403)
        assert.equal(body.code, 'FORBIDDEN_ACCESS')
    })

    test('it return 422 when email is already in use', async (assert) => {
        let other = await UserFactory.create()
        payload = await UserFactory.merge({ email: other.email }).makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when username is already in use', async (assert) => {
        let other = await UserFactory.create()
        payload = await UserFactory.merge({ username: other.username }).makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async (assert) => {
        payload = await UserFactory.apply('email').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async (assert) => {
        payload = await UserFactory.apply('avatar').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async (assert) => {
        payload = await UserFactory.apply('username').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async (assert) => {
        payload = await UserFactory.apply('password').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it GET /users/:user', async (assert) => {
        let { body } = await supertest(BASE_URL).get(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .expect(200)

        assert.equal(body.id, user.id)
        assert.equal(body.email, user.email)
        assert.equal(body.username, user.username)
    })

    test('it return 404 when dungeons is not persisted', async (assert) => {
        user = await UserFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).get(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it DELETE /users/:user', async () => {
        await supertest(BASE_URL).delete(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .expect(204)
    })

    test('it return 404 when dungeons is not persisted', async (assert) => {
        user = await UserFactory.apply('deleted').create()
        let { body } = await supertest(BASE_URL).delete(`/users/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    group.afterEach(async () => {
        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ token }`)
        await Database.rollbackGlobalTransaction()
    })
})
