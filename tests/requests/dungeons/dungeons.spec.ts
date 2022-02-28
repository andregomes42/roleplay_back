import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
const { faker } = require('@faker-js/faker');
import { UserFactory } from 'Database/factories/user'
import { DungeonFactory } from 'Database/factories/dungeon';

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let token
let password
let dungeon

test.group('Dungeons', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        password = faker.internet.password()
        user = await UserFactory.merge({ password }).create()

        const { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        token = body.token.token
    })

    test('it POST /dungeons', async (assert) => {
        dungeon = await DungeonFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(201)

        assert.equal(body.master_id, user.id)
        assert.equal(body.name, dungeon.name)
        assert.equal(body.players[0].id, user.id)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        dungeon = await DungeonFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/dungeons')
            .send(dungeon).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it returns 422 when no body is provided', async(assert) => {
        const { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid name', async(assert) => {
        dungeon = await DungeonFactory.apply('name').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid chronic', async(assert) => {
        dungeon = await DungeonFactory.apply('chronic').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid schedule', async(assert) => {
        dungeon = await DungeonFactory.apply('schedule').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)
            
        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid location', async(assert) => {
        dungeon = await DungeonFactory.apply('location').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid description', async(assert) => {
        dungeon = await DungeonFactory.apply('description').makeStubbed()
        const { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    group.afterEach(async () => {
        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ token }`)
        await Database.rollbackGlobalTransaction()
    })
})
