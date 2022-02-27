import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/user'
import { DungeonFactory } from 'Database/factories/dungeon';
const { faker } = require('@faker-js/faker');

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let token
let password
let dungeon
let makeDungeon

test.group('Dungeons Requests', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        password = faker.internet.password()
        user = await UserFactory.merge({ password }).create()
        dungeon = await DungeonFactory.with('master')
            .with('players', 2, (player) => player.merge({ password })).create()

        const { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        token = body.token.token
    })

    test('it POST /dungeons/:id/requests', async (assert) => {
        const { body } = await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(201)

        assert.equal(body.status, 'PENDING')
        assert.equal(body.user_id, user.id)
        assert.equal(body.dungeon_id, dungeon.id)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        makeDungeon = await DungeonFactory.with('master').makeStubbed()
        const { body } = await supertest(BASE_URL).post(`/dungeons/${ makeDungeon.id }/requests`)
            .send({}).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 404 when dungeons is not persisted', async (assert) => {
        makeDungeon = await DungeonFactory.with('master').makeStubbed()
        const { body } = await supertest(BASE_URL).post(`/dungeons/${ makeDungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 409 when dungeons request already exists', async (assert) => {
        await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(201)

        const { body } = await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.message, 'Dungeon request already exists')
    })

    test('it return 409 when user is already in the dungeon', async (assert) => {
        const { email } = dungeon.players[0]        
        const response = await supertest(BASE_URL).post('/login')
            .send({ email, password }).expect(201)
        token = response.body.token.token

        const { body } = await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.message, 'User is already in the dungeon')
    })

    group.afterEach(async () => {
        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ token }`)
        await Database.rollbackGlobalTransaction()
    })
})