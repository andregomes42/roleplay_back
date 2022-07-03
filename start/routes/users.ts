import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('', 'UsersController.store')
    Route.put('/:user', 'UsersController.update').middleware('auth')
    Route.post('/forgot-password', 'PasswordsController.forgot')
    Route.post('/reset-password', 'PasswordsController.reset')
  }).prefix('/api/v1/users')