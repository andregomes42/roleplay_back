import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import StoreUser from 'App/Validators/StoreUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'
import User from 'App/Models/User'

export default class UsersController {
    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(StoreUser)

        if(await User.findBy('email', payload.email))
            throw new BadRequest('email is arealdy in use', 409)

        if(await User.findBy('username', payload.username))
            throw new BadRequest('username is arealdy in use', 409)

        const user = await User.create(payload)
        return response.created({ user })
    }

    public async update({ request, response, bouncer }: HttpContextContract) {
        const payload = await request.validate(UpdateUser)
        const user = await User.findOrFail(request.param('user'))

        await bouncer.authorize('userUpdate', user)

         if(await User.findBy('email', payload.email))
            throw new BadRequest('email is arealdy in use', 409)

        if(await User.findBy('username', payload.username))
            throw new BadRequest('username is arealdy in use', 409)

        payload.email ? user.email = payload.email : false
        payload.avatar ? user.avatar = payload.avatar : false
        payload.username ? user.username = payload.username : false
        payload.password ? user.password = payload.password : false
        await user.save()

        return response.ok({ user })
    }
}
