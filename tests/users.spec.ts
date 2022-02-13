import { UserFactory } from 'Database/factories/user'
import test from 'japa'
import supertest from 'supertest'


const BASE_URL = `http://${process.env.HOST }:${process.env.PORT}/api/v1`

test.group('Users', () => {
    test('it POST /users', async (assert) => {
        const user = await UserFactory.makeStubbed()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(201)

        assert.equal(body.user.username, user.username)
    })
})