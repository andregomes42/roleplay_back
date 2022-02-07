import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST }:${process.env.PORT}/api/v1`

test.group('Users', () => {
    test('it POST /users', async (assert) => {
        const user =  await UserFactory.create()
        const { body } = await supertest(BASE_URL).post('/users').send(user).expect(201)
        console.log(body)  

        assert.equal(body.user.username, user.username)
    })
})