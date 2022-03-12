import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
const { faker } = require('@faker-js/faker');
import { UserFactory } from 'Database/factories/user'

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let apiToken
let password 

test.group('Authentications', (group) => {
    group.beforeEach(async () => {
        password = faker.internet.password()
        await Database.beginGlobalTransaction()
        user = await UserFactory.merge({ password }).create()

        let { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        apiToken = body.token.token
    })  

    test('it POST /login', async (assert) => {
        let { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)

        assert.isDefined(body.user, 'User undefined')
        assert.equal(body.user.id, user.id)
        assert.isDefined(body.token, 'Token undefined')
    })

    test('it return 400 when provides an incorrect email', async (assert) => {
        user = await UserFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(400)

        assert.equal(body.status, 400)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 400 when provides an incorrect password', async (assert) => {
        let { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password: user.password }).expect(400)

        assert.equal(body.status, 400)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when no body is provided', async (assert) => {
        let { body } = await supertest(BASE_URL).post('/login')
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it POST /logout', async (assert) => {
        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ apiToken }`).expect(200)
        let token = await Database.query().select('*').from('api_tokens')

        assert.isEmpty(token)
    })

    group.afterEach(async () => {
        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ apiToken }`)
        await Database.rollbackGlobalTransaction()
    })
})
