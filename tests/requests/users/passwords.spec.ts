import Hash from '@ioc:Adonis/Core/Hash'
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/user'
import Mail from '@ioc:Adonis/Addons/Mail'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { DateTime, Duration } from 'luxon'
const { faker } = require('@faker-js/faker');

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let payload
let random
let token
let date
let password

test.group('Passwords', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        user = await UserFactory.create()
        random = await promisify(randomBytes)(24)
        token = random.toString('hex')
        password = faker.internet.password()
    })

    test('it POST /users/forgot-passsword', async (assert) => {
        Mail.trap((message) => {
            assert.deepEqual(message.from, { address: 'no-reply@roleplay.com' })
            assert.deepEqual(message.to, [{ address: user.email }])
            assert.equal(message.subject, 'Roleplay: Reset password')
            assert.include(message.html, user.username)
            assert.include(message.html, user.avatar)
        })
        
        await supertest(BASE_URL).post('/users/forgot-password').send({
            email: user.email,
            resetPasswordUrl: user.avatar
        }).expect(204)

        Mail.restore()

        let tokens = await user.related('tokens').query()
        assert.isNotEmpty(tokens)
    })

    test('it return 422 when no body is provided', async (assert) => {
        let { body } = await supertest(BASE_URL).post('/users/forgot-password')
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async (assert) => {
        let { body } = await supertest(BASE_URL).post('/users/forgot-password').send({
            email: user.username,
            resetPasswordUrl: user.avatar
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid reset password url', async (assert) => {
        let { body } = await supertest(BASE_URL).post('/users/forgot-password').send({
            email: user.email,
            resetPasswordUrl: user.username
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it POST /users/reset-password', async (assert) => {
        await user.related('tokens').create({ token })

        await supertest(BASE_URL).post('/users/reset-password')
            .send({ token, password }).expect(204)

        await user.refresh()
        assert.isTrue(await Hash.verify(user.password, password))
    })

    test('it return 422 when no body is provided', async (assert) => {
        let { body } = await supertest(BASE_URL).post('/users/reset-password')
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async (assert) => {
        payload = await UserFactory.apply('password').makeStubbed()
        await user.related('tokens').create({ token })

        let { body } = await supertest(BASE_URL).post('/users/reset-password').send({
            token,
            password: payload.password
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 404 when using the same token twice', async (assert) => {
        await user.related('tokens').create({ token })

        await supertest(BASE_URL).post('/users/reset-password')
            .send({ token, password }).expect(204)

        let { body } = await supertest(BASE_URL).post('/users/reset-password')
            .send({ token, password }).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 410 when use an expired token', async (assert) => {
        date = DateTime.now().minus(Duration.fromISOTime('02:01'))
        await user.related('tokens').create({ token, createdAt: date })

        let { body } = await supertest(BASE_URL).post('/users/reset-password')
            .send({ token, password }).expect(410)

        assert.equal(body.status, 410)
        assert.equal(body.code, 'TOKEN_EXPIRED')
        assert.equal(body.message, 'Token has expired')
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})
