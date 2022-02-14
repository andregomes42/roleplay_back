import Hash from '@ioc:Adonis/Core/Hash'
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/user'
import Mail from '@ioc:Adonis/Addons/Mail'
import { promisify } from 'util'
import { randomBytes } from 'crypto'

const BASE_URL = `http://${process.env.HOST }:${process.env.PORT}/api/v1`

test.group('Users', (group) => {
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

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 409 when username is arelady in use', async(assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.merge({ username: user.username }).makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(fakeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it returns 422 when no body is provided', async(assert) => {
        const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async(assert) => {
        const user = await UserFactory.apply('email').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async(assert) => {
        const user = await UserFactory.apply('avatar').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async(assert) => {
        const user = await UserFactory.apply('username').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async(assert) => {
        const user = await UserFactory.apply('password').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it PUT /users/:user', async (assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.makeStubbed()
        await supertest(BASE_URL).put(`/users/${user.id}`).send(fakeUser).expect(200)
        await user.refresh()

        assert.isTrue(await Hash.verify(user.password, fakeUser.password))
        assert.equal(user.email, fakeUser.email)
        assert.equal(user.avatar, fakeUser.avatar)
        assert.equal(user.username, fakeUser.username)
    })

    test('it return 409 when email is already in use', async (assert) => {
        const user = await UserFactory.create()
        const secondUser = await UserFactory.create()
        const fakeUser = await UserFactory.merge({email: user.email}).makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${secondUser.id}`).send(fakeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 409 when username is already in use', async (assert) => {
        const user = await UserFactory.create()
        const secondUser = await UserFactory.create()
        const fakeUser = await UserFactory.merge({username: user.username}).makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${secondUser.id}`).send(fakeUser).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when no body is provided', async (assert) => {
        const user = await UserFactory.create()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async (assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.apply('email').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send(fakeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid avatar', async (assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.apply('avatar').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send(fakeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid username', async (assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.apply('username').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send(fakeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async (assert) => {
        const user = await UserFactory.create()
        const fakeUser = await UserFactory.apply('password').makeStubbed()
        const { body } = await supertest(BASE_URL).put(`/users/${user.id}`).send(fakeUser).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})

test.group('Password', (group) => {
    test('it POST /users/forgot/passsword', async (assert) => {
        const user = await UserFactory.create()

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
        const user = await UserFactory.create()
        const { body } = await supertest(BASE_URL).post('/users/forgot-password').send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid email', async (assert) => {
        const user = await UserFactory.create()
        const { body } = await supertest(BASE_URL).post('/users/forgot-password').send({
            email: user.username,
            resetPasswordUrl: user.avatar
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid reset password url', async (assert) => {
        const user = await UserFactory.create()
        const { body } = await supertest(BASE_URL).post('/users/forgot-password').send({
            email: user.email,
            resetPasswordUrl: user.username
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it POST /users/reset-password', async (assert) => {
        const user = await UserFactory.create()
        const random = await promisify(randomBytes)(24)
        const token = random.toString('hex')
        await user.related('tokens').create({ token })

        await supertest(BASE_URL).post('/users/reset-password').send({
            token,
            password: 'admin123'
        }).expect(204)

        await user.refresh()
        assert.isTrue(await Hash.verify(user.password, 'admin123'))
    })

    test('it return 422 when no body is provided', async (assert) => {
        const user = await UserFactory.create()
        const { body } = await supertest(BASE_URL).post('/users/reset-password').send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid password', async (assert) => {
        const fakeUser = await UserFactory.apply('password').makeStubbed()
        const user = await UserFactory.create()
        const random = await promisify(randomBytes)(24)
        const token = random.toString('hex')
        await user.related('tokens').create({ token })

        const { body } = await supertest(BASE_URL).post('/users/reset-password').send({
            token,
            password: fakeUser.password
        }).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 404 when using the same token twice', async (assert) => {
        const user = await UserFactory.create()
        const random = await promisify(randomBytes)(24)
        const token = random.toString('hex')
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

    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})
