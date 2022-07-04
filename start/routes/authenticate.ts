import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('/login', 'AuthController.login')
    Route.delete('/logout', 'AuthController.logout').middleware('auth')
}).prefix('api/v1')