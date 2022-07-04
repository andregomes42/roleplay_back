import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import StoreUser from 'App/Validators/StoreUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'
import UserService from 'App/Services/UserService'
import User from 'App/Models/User'

export default class UsersController {
    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(StoreUser)

        if(await User.findBy('email', payload.email))
            throw new BadRequest('email is arealdy in use', 409)

        if(await User.findBy('username', payload.username))
            throw new BadRequest('username is arealdy in use', 409)

        const user = await UserService.create(payload)
        return response.created(user)
    }

    public async update({ request, response, bouncer }: HttpContextContract) {
        const payload = await request.validate(UpdateUser)

        let user = await User.findOrFail(request.param('user'))
        await bouncer.authorize('check_user', user)

        if(payload.email && await User.findBy('email', payload.email))
            throw new BadRequest('email is arealdy in use', 409)

        if(payload.username && await User.findBy('username', payload.username))
            throw new BadRequest('username is arealdy in use', 409)

        user = await UserService.update(payload, user)

        return response.ok(user)
    }
}
