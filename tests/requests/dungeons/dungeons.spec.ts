import Player from 'App/Models/Player';
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
const { faker } = require('@faker-js/faker');
import { UserFactory } from 'Database/factories/user'
import { DungeonFactory } from 'Database/factories/dungeon';
import { PlayerFactory } from 'Database/factories/player';
import Dungeon from 'App/Models/Dungeon';

const BASE_URL = `http://${ process.env.HOST }:${ process.env.PORT }/api/v1`

let user
let token
let password
let dungeon
let payload

test.group('Dungeons', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
        password = faker.internet.password()
        user = await UserFactory.merge({ password }).create()

        let { body } = await supertest(BASE_URL).post('/login')
            .send({ email: user.email, password }).expect(201)
        token = body.token.token
    })

    test('it GET /dungeons', async (assert) => {
        await PlayerFactory.merge({ user_id: user.id })
            .with('dungeon', 1, (dungeon) => dungeon.with('master'))
            .createMany(10);
        let { body } = await supertest(BASE_URL).get('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send().expect(200)

        assert.equal(body.data.length, 5)
        assert.equal(body.meta.total, 10)
    })

    test('it return 401 when user is not authenticates', async(assert) => {
        let { body } = await supertest(BASE_URL).get('/dungeons')
            .send().expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it POST /dungeons', async (assert) => {
        dungeon = await DungeonFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(201)

        assert.equal(body.master_id, user.id)
        assert.equal(body.name, dungeon.name)
        assert.equal(body.players.at(0).id, user.id)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        dungeon = await DungeonFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).post('/dungeons')
            .send(dungeon).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it returns 422 when no body is provided', async(assert) => {
        let { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send({}).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid name', async(assert) => {
        dungeon = await DungeonFactory.apply('name').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid chronic', async(assert) => {
        dungeon = await DungeonFactory.apply('chronic').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid schedule', async(assert) => {
        dungeon = await DungeonFactory.apply('schedule').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)
            
        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid location', async(assert) => {
        dungeon = await DungeonFactory.apply('location').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid description', async(assert) => {
        dungeon = await DungeonFactory.apply('description').makeStubbed()
        let { body } = await supertest(BASE_URL).post('/dungeons')
            .set('Authorization', `Bearer ${ token }`)
            .send(dungeon).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it PUT /dungeons/:dungeon', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        payload = await DungeonFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(200)

        assert.equal(body.master_id, user.id)
        assert.equal(body.name, payload.name)
        assert.equal(body.schedule, payload.schedule)
        assert.equal(body.location, payload.location)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        payload = await DungeonFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .send(payload).expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 403 when user is not the dungeon master', async (assert) => {
        dungeon = await DungeonFactory.with('master').create()
        payload = await DungeonFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(403)

        assert.equal(body.status, 403)
        assert.equal(body.code, 'FORBIDDEN_ACCESS')
    })

    test('it return 404 when provides an invalid dungeon id', async (assert) => {
        dungeon = await DungeonFactory.with('master').makeStubbed()
        payload = await DungeonFactory.makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 422 when provides an invalid name', async(assert) => {
        dungeon = await DungeonFactory.with('master').create()
        payload = await DungeonFactory.apply('name').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid chronic', async(assert) => {
        dungeon = await DungeonFactory.with('master').create()
        payload = await DungeonFactory.apply('chronic').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid schedule', async(assert) => {
        dungeon = await DungeonFactory.with('master').create()
        payload = await DungeonFactory.apply('schedule').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)
            
        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid location', async(assert) => {
        dungeon = await DungeonFactory.with('master').create()
        payload = await DungeonFactory.apply('location').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it return 422 when provides an invalid description', async(assert) => {
        dungeon = await DungeonFactory.with('master').create()
        payload = await DungeonFactory.apply('description').makeStubbed()
        let { body } = await supertest(BASE_URL).put(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send(payload).expect(422)

        assert.equal(body.status, 422)
        assert.equal(body.code, 'BAD_REQUEST')
    })

    test('it DELETE /dungeons/:dungeon/', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).with('players', 3).create()
        await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send().expect(204)

        assert.isEmpty(await Player.all())
        assert.isEmpty(await Dungeon.all())
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).with('players', 3).create()
        let { body } = await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }`)
            .send().expect(401)


        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 404 when provides an invalid dungeon id', async (assert) => {
         dungeon = await DungeonFactory.merge({ master_id: user.id }).with('players', 3).makeStubbed()
        let { body } = await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send().expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 403 when user is not the dungeon master', async (assert) => {
        dungeon = await DungeonFactory.with('master').with('players').create()
        let { body } = await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send().expect(403)

        assert.equal(body.status, 403)
        assert.equal(body.code, 'FORBIDDEN_ACCESS')
    })

    test('it DELETE /dungeons/:dungeon/players/:player', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        await PlayerFactory.merge({ user_id: user.id, dungeon_id: dungeon.id }).create()
        await PlayerFactory.merge({ dungeon_id: dungeon.id }).with('user').createMany(2)
        await dungeon.load('players')
        let player = dungeon.players.at(2)
        let { body } = await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }/players/${ player.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send().expect(200)

        assert.isNotEmpty(body.players)
        assert.equal(body.players.length, 2)
    })

    test('it return 401 when user is not authenticated', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        let { body } = await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }/players/${ user.id }`)
            .send().expect(401)

        assert.equal(body.status, 401)
        assert.equal(body.code, 'UNAUTHORIZED_ACCESS')
    })

    test('it return 404 when provides an invalid dungeon id', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).makeStubbed()
        let { body } = await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }/players/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send().expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 404 when provides an invalid player id', async (assert) => {
        dungeon = await DungeonFactory.merge({ master_id: user.id }).create()
        await PlayerFactory.merge({ user_id: user.id, dungeon_id: dungeon.id }).makeStubbed()
        let { body } = await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }/players/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send().expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.message, 'Resource not found')
    })

    test('it return 403 when user is not the dungeon master', async (assert) => {
        dungeon = await DungeonFactory.with('master').create()
        await PlayerFactory.merge({ user_id: user.id, dungeon_id: dungeon.id }).create()
        let { body } = await supertest(BASE_URL).delete(`/dungeons/${ dungeon.id }/players/${ user.id }`)
            .set('Authorization', `Bearer ${ token }`)
            .send().expect(403)

        assert.equal(body.status, 403)
        assert.equal(body.code, 'FORBIDDEN_ACCESS')
    })

    group.afterEach(async () => {
        await supertest(BASE_URL).delete('/logout')
            .set('Authorization', `Bearer ${ token }`)
        await Database.rollbackGlobalTransaction()
    })
})
