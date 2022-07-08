import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StoreUser from 'App/Validators/StoreUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'
import UserService from 'App/Services/UserService'
import User from 'App/Models/User'

export default class UsersController {
    public async index({ request, response }: HttpContextContract) {
        const users = await UserService.index(
            request.input('search'),
            request.input('page', 1),
            request.input('perPage', 999))
            
        return response.ok(users)
    }

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

    public async show({ request, response }: HttpContextContract) {
        let user = await User.findOrFail(request.param('user'))

        return response.ok(user)
    }

    public async destroy({ request, response, bouncer }: HttpContextContract) {
        let user = await User.findOrFail(request.param('user'))
        await bouncer.authorize('check_user', user)

        await user.delete()

        return response.noContent()
    }
}
