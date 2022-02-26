import Hash from '@ioc:Adonis/Core/Hash'
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/user'
import Mail from '@ioc:Adonis/Addons/Mail'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { DateTime, Duration } from 'luxon'

const BASE_URL = `http://${process.env.HOST }:${process.env.PORT}/api/v1`

let user
let makeUser
let random
let token
let date
let password = '123'

test.group('Users', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        user = await UserFactory.create()
    })  

    test('it POST /users', async (assert) => {
        makeUser = await UserFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(makeUser).expect(201)

        assert.equal(body.user.username, makeUser.username)
        assert.equal(body.user.email, makeUser.email)
    })

    test('it return 409 when email is arelady in use', async(assert) => {
        makeUser = await UserFactory.merge({ email: user.email }).makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(makeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 409 when username is arelady in use', async(assert) => {
        makeUser = await UserFactory.merge({ username: user.username }).makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(makeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it returns 422 when no body is provided', async(assert) => {
        const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async(assert) => {
        makeUser = await UserFactory.apply('email').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async(assert) => {
        makeUser = await UserFactory.apply('avatar').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async(assert) => {
        makeUser = await UserFactory.apply('username').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async(assert) => {
        makeUser = await UserFactory.apply('password').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it PUT /users/:user', async (assert) => {
        makeUser = await UserFactory.makeStubbed()
        await supertest(BASE_URL).put(`/users/${user.id}`).send(makeUser).expect(200)
        await user.refresh()

        assert.isTrue(await Hash.verify(user.password, makeUser.password))
        assert.equal(user.email, makeUser.email)
        assert.equal(user.avatar, makeUser.avatar)
        assert.equal(user.username, makeUser.username)
    })

    test('it return 409 when email is already in use', async (assert) => {
        makeUser = await UserFactory.merge({email: user.email}).makeStubbed()
        const secondUser = await UserFactory.create()
        const { body } = await supertest(BASE_URL).put(`/users/${secondUser.id}`).send(makeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 409 when username is already in use', async (assert) => {
        makeUser = await UserFactory.merge({username: user.username}).makeStubbed()
        const secondUser = await UserFactory.create()
        const { body } = await supertest(BASE_URL).put(`/users/${secondUser.id}`).send(makeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when no body is provided', async (assert) => {
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async (assert) => {
        makeUser = await UserFactory.apply('email').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async (assert) => {
        makeUser = await UserFactory.apply('avatar').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async (assert) => {
        makeUser = await UserFactory.apply('username').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async (assert) => {
        makeUser = await UserFactory.apply('password').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send(makeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})

test.group('Password', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        user = await UserFactory.create()
        random = await promisify(randomBytes)(24)
        token = random.toString('hex')
    })

    test('it POST /users/forgot/passsword', async (assert) => {
        Mail.trap((message) => {
            assert.deepEqual(message.from, {address: 'no-reply@roleplay.com'})
            assert.deepEqual(message.to, [{address: user.email}])
            assert.equal(message.subject, 'Roleplay: Reset password')
            assert.include(message.html, user.username)
            assert.include(message.html, user.avatar)
        })
        
        await supertest(BASE_URL).post('/users/forgot-password').send({
            email: user.email,
            resetPasswordUrl: user.avatar
        }).expect(204)

        Mail.restore()

        const tokens = await user.related('tokens').query()
        assert.isNotEmpty(tokens)
    })

    test('it return 422 when no body is provided', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/users/forgot-password').send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/users/forgot-password').send({
            email: user.username,
            resetPasswordUrl: user.avatar
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid reset password url', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/users/forgot-password').send({
            email: user.email,
            resetPasswordUrl: user.username
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it POST /users/reset-password', async (assert) => {
        await user.related('tokens').create({ token })

        await supertest(BASE_URL).post('/users/reset-password').send({
            token,
            password: 'admin123'
        }).expect(204)

        await user.refresh()
        assert.isTrue(await Hash.verify(user.password, 'admin123'))
    })

    test('it return 422 when no body is provided', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/users/reset-password').send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async (assert) => {
        makeUser = await UserFactory.apply('password').makeStubbed()
        await user.related('tokens').create({ token })

        const { body } = await supertest(BASE_URL).post('/users/reset-password').send({
            token,
            password: makeUser.password
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 404 when using the same token twice', async (assert) => {
        await user.related('tokens').create({ token })

        await supertest(BASE_URL).post('/users/reset-password').send({
            token,
            password: 'admin123'
        }).expect(204)

        const { body } = await supertest(BASE_URL).post('/users/reset-password').send({
            token,
            password: 'admin123'
        }).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 410 when use an expired token', async (assert) => {
        date = DateTime.now().minus(Duration.fromISOTime('02:01'))
        await user.related('tokens').create({ token, createdAt: date })

        const { body } = await supertest(BASE_URL).post('/users/reset-password').send({
            token,
            password: 'admin123'
        }).expect(410)

        assert.equal(body.status, 410)
        assert.equal(body.code, 'TOKEN_EXPIRED')
        assert.equal(body.message, 'Token has expired')
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})

test.group('Authentication', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        user = await UserFactory.merge({ password }).create()
    })  

    test('it POST /login', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/login').send({ email: user.email, password }).expect(201)

        assert.isDefined(body.user, 'User undefined')
        assert.equal(body.user.id, user.id)
        assert.isDefined(body.token, 'Token undefined')
    })

    test('it return 400 when provides an incorrect email', async (assert) => {
        makeUser = await UserFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/login').send({ email: makeUser.email, password }).expect(400)

        assert.equal(body.status, 400)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.message, 'Invalid credentials')

    })

    test('it return 400 when provides an incorrect password', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/login').send({ email: user.email, password: user.password }).expect(400)

        assert.equal(body.status, 400)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.message, 'Invalid credentials')
    })

    test('it return 422 when no body is provided', async (assert) => {
       const { body } = await supertest(BASE_URL).post('/login').send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test.only('it POST /logout', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/login').send({ email: user.email, password }).expect(201)
        const apiToken = body.token

        await supertest(BASE_URL).delete('/logout').set('Authorization', `Bearer ${apiToken.token}`).expect(200)
        const token = await Database.query().select('*').from('api_tokens')

        assert.isEmpty(token)
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})