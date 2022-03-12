import { beforeSave } from '@ioc:Adonis/Lucid/Orm';
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/user'
import { DungeonFactory } from 'Database/factories/dungeon';
import { DungeonRequestFactory } from 'Database/factories/dungeon_request';
const { faker } = require('@faker-js/faker');

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let token
let password
let dungeon
let dungeon_request

test.group('Dungeons Requests', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        password = faker.internet.password()
        user = await UserFactory.merge({ password }).create()
        dungeon = await DungeonFactory.with('master')
            .with('players', 2, (player) => player.merge({ password })).create()

        let { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        token = body.token.token
    })

    test('it POST /dungeons/:id/requests', async (assert) => {
        let { body } = await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(201)

        assert.equal(body.status, 'pending')
        assert.equal(body.user_id, user.id)
        assert.equal(body.dungeon_id, dungeon.id)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        let { body } = await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .send({}).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 404 when dungeons is not persisted', async (assert) => {
        dungeon = await DungeonFactory.with('master').makeStubbed()
        let { body } = await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 409 when dungeons request already exists', async (assert) => {
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).create()
        let { body } = await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.message, 'Dungeon request already exists')
    })

    test('it return 409 when user is already in the dungeon', async (assert) => {
        dungeon = await DungeonFactory.with('master').with('players', 1, (player) => player.merge(user)).create()
        let { body } = await supertest(BASE_URL).post(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(409)

        assert.equal(body.status, 409)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.message, 'User is already in the dungeon')
    })

    test('it GET /dungeons/:dungeon/requests', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).create()
        let { body } = await supertest(BASE_URL).get(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(200)

        assert.equal(body[0].status, 'pending')
        assert.equal(body[0].user_id, user.id)
        assert.equal(body[0].dungeon_id, dungeon.id)
    })

    test('it return an empty list when master has no dungeon request', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        let { body } = await supertest(BASE_URL).get(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(200)

        assert.isEmpty(body)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        let { body } = await supertest(BASE_URL).get(`/dungeons/${ dungeon.id }/requests`)
            .send({}).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 404 when user is not the dungeon master', async (assert) => {
        dungeon = await DungeonFactory.with('master').create()        
        let { body } = await supertest(BASE_URL).get(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 404 when dungeons is not persisted', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).makeStubbed()
        let { body } = await supertest(BASE_URL).get(`/dungeons/${ dungeon.id }/requests`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it PATCH /dungeons/requests/:dungeon_request?status=accepted', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).create()
        let { body } = await supertest(BASE_URL).patch(`/dungeons/requests/${ dungeon_request.id }?status=accepted`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(200)

        assert.equal(body.status, 'accepted')
        assert.equal(body.dungeon_id, dungeon.id)
        assert.equal(body.dungeon.master_id, user.id)

        await dungeon.load('players')

        assert.isNotEmpty(dungeon.players)
        assert.equal(dungeon.players.length, 1)
        assert.equal(dungeon.players[0].id, user.id)
    })

    test('it PATCH /dungeons/requests/:dungeon_request?status=rejected', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).create()
        let { body } = await supertest(BASE_URL).patch(`/dungeons/requests/${ dungeon_request.id }?status=rejected`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(200)

        assert.equal(body.status, 'rejected')
        assert.equal(body.dungeon_id, dungeon.id)
        assert.equal(body.dungeon.master_id, user.id)

        await dungeon.load('players')

        assert.isEmpty(dungeon.players)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).create()
        let { body } = await supertest(BASE_URL).patch(`/dungeons/requests/${ dungeon_request.id }?status=accepted`)
            .send({}).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 403 when user is not the dungeon master', async (assert) => {
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).create()
        let { body } = await supertest(BASE_URL).patch(`/dungeons/requests/${ dungeon_request.id }?status=accepted`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(403)

        assert.equal(body.status, 403)
        assert.equal(body.code, 'FORBIDDEN_ACCESS')
    })

    test('it return 404 when user is not the dungeon request is not persisted', async (assert) => {
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).makeStubbed()
        let { body } = await supertest(BASE_URL).patch(`/dungeons/requests/${ dungeon_request.id }?status=accepted`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 422 when status is not provided', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).create()
        let { body } = await supertest(BASE_URL).patch(`/dungeons/requests/${ dungeon_request.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid status', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        dungeon_request = await DungeonRequestFactory.merge({ dungeon_id: dungeon.id, user_id: user.id }).create()
        let { body } = await supertest(BASE_URL).patch(`/dungeons/requests/${ dungeon_request.id }?status=${ user.username }`)
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    group.afterEach(async () => {
        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ token }`)
        await Database.rollbackGlobalTransaction()
    })
})