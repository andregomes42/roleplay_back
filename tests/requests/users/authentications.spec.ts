import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
const { faker } = require('@faker-js/faker');
import { UserFactory } from 'Database/factories/user'

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let makeUser
let password 

test.group('Authentications', (group) => {
    group.beforeEach(async () => {
        password = faker.internet.password()
        await Database.beginGlobalTransaction()
        user = await UserFactory.merge({ password }).create()
    })  

    test('it POST /login', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)

        assert.isDefined(body.user, 'User undefined')
        assert.equal(body.user.id, user.id)
        assert.isDefined(body.token, 'Token undefined')
    })

    test('it return 400 when provides an incorrect email', async (assert) => {
        makeUser = await UserFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/login')
            .send({ email: makeUser.email, password }).expect(400)

        assert.equal(body.status, 400)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 400 when provides an incorrect password', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password: user.password }).expect(400)

        assert.equal(body.status, 400)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when no body is provided', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/login')
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it POST /logout', async (assert) => {
        const { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        const apiToken = body.token.token

        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ apiToken }`).expect(200)
        const token = await Database.query().select('*').from('api_tokens')

        assert.isEmpty(token)
    })

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})
