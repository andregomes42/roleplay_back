import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('/login', 'AuthController.login')
    Route.delete('/logout', 'AuthController.logout').middleware('auth')

    Route.post('/forgot-password', 'PasswordsController.forgot')
    Route.post('/reset-password', 'PasswordsController.reset')
}).prefix('/api/v1')