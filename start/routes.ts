import Route from '@ioc:Adonis/Core/Route'
import './routes/users'
import './routes/authenticate'
import './routes/dungeons'

Route.get('/', async () => {
  return { hello: 'world' }
})
