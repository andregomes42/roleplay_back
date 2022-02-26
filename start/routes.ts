/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.group(() => {
    Route.post('', 'UsersController.store')
    Route.put('/:user', 'UsersController.update').middleware('auth')
    Route.post('/forgot-password', 'PasswordsController.forgot')
    Route.post('/reset-password', 'PasswordsController.reset')
  }).prefix('/users')

  Route.post('/login', 'AuthController.login')
  Route.delete('/logout', 'AuthController.logout')

  Route.group(() => {
    Route.post('', 'DungeonsController.store')
  }).middleware('auth').prefix('/dungeons')
}).prefix('/api/v1')
