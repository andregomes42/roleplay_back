import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('', 'DungeonsController.index')
    Route.post('', 'DungeonsController.store')
    Route.put('/:dungeon', 'DungeonsController.update')
    Route.delete('/:dungeon', 'DungeonsController.destroy')
    Route.delete('/:dungeon/players/:player', 'DungeonsController.removePlayer')

    Route.group(() => {
        Route.get('/:dungeon/requests', 'DungeonsRequestsController.index')
        Route.post('/:dungeon/requests', 'DungeonsRequestsController.store')
        Route.patch('/requests/:dungeon_request', 'DungeonsRequestsController.update')
    })
}).middleware('auth').prefix('/api/v1/dungeons')