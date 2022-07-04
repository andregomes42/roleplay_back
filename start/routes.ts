import Route from '@ioc:Adonis/Core/Route'
import './routes/users'
import './routes/authenticate'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.group(() => {
    Route.get('', 'DungeonsController.index')
    Route.post('', 'DungeonsController.store')
    Route.put('/:dungeon', 'DungeonsController.update')
    Route.delete('/:dungeon', 'DungeonsController.destroy')

    Route.group(() => {
      Route.get('/:dungeon/requests', 'DungeonsRequestsController.index')
      Route.post('/:dungeon/requests', 'DungeonsRequestsController.store')
      Route.patch('/requests/:dungeon_request', 'DungeonsRequestsController.update')
      Route.delete('/:dungeon/players/:player', 'DungeonsController.removePlayer')
    })
  }).middleware('auth').prefix('/dungeons')
}).prefix('/api/v1')
