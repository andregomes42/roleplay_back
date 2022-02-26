import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
const { faker } = require('@faker-js/faker');
import { UserFactory } from 'Database/factories/user'
import { GroupFactory } from 'Database/factories/group';

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let token
let password
let makeGroup

test.group('Groups', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        password = faker.internet.password()
        user = await UserFactory.merge({ password }).create()

        const { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        token = body.token.token
    })

    test.only('it POST /groups', async (assert) => {
        makeGroup = await GroupFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/groups')
            .set('Authorization', `Bearer ${ token }`)
            .send(makeGroup).expect(201)

        assert.equal(body.master_id, user.id)
        assert.equal(body.name, makeGroup.name)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        makeGroup = await GroupFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/groups')
            .send(makeGroup).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it returns 422 when no body is provided', async(assert) => {
        makeGroup = await GroupFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/groups')
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid name', async(assert) => {
        makeGroup = await GroupFactory.apply('name').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/groups')
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid chronic', async(assert) => {
        makeGroup = await GroupFactory.apply('chronic').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/groups')
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid schedule', async(assert) => {
        makeGroup = await GroupFactory.apply('schedule').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/groups')
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid location', async(assert) => {
        makeGroup = await GroupFactory.apply('location').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/groups')
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid description', async(assert) => {
        makeGroup = await GroupFactory.apply('description').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/groups')
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })
})
