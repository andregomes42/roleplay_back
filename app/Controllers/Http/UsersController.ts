import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StoreUser from 'App/Validators/StoreUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'
import UserService from 'App/Services/UserService'
import User from 'App/Models/User'

export default class UsersController {
    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(StoreUser)

        const user = await UserService.create(payload)
        return response.created(user)
    }

    public async update({ request, response, bouncer }: HttpContextContract) {
        const payload = await request.validate(UpdateUser)

        let user = await User.findOrFail(request.param('user'))
        await bouncer.authorize('check_user', user)

        user = await UserService.update(payload, user)

        return response.ok(user)
    }
}
