import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('', 'UsersController.store')
    Route.get('', 'UsersController.index')

    Route.group(() => {
        Route.put('/:user', 'UsersController.update')
        Route.get('/:user', 'UsersController.show')
        Route.delete('/:user', 'UsersController.destroy')
    }).middleware('auth')

    Route.post('/forgot-password', 'PasswordsController.forgot')
    Route.post('/reset-password', 'PasswordsController.reset')
}).prefix('/api/v1/users')