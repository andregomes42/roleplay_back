import Hash from '@ioc:Adonis/Core/Hash'
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/user'
import Mail from '@ioc:Adonis/Addons/Mail'

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
        
        await supertest(BASE_URL).post('/users/forgot/password').send({
            email: user.email,
            resetPasswordUrl: user.avatar
        }).expect(204)

        Mail.restore()
    })

    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})
