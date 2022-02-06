import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST }:${process.env.PORT}`

test.group('Example', () => {
    test('it GET /', async () => {
        supertest(BASE_URL).get('/').expect(200)
    })
})