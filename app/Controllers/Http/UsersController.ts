import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import StoreUser from 'App/Validators/StoreUserValidator'
import User from 'App/Models/User'

export default class UsersController {
    public async store({request, response}: HttpContextContract) {
        const payload = await request.validate(StoreUser)

        if(await User.findBy('email', payload.email))
            throw new BadRequest('email is arealdy in use', 409)

        if(await User.findBy('username', payload.username))
            throw new BadRequest('username is arealdy in use', 409)

        const user = await User.create(payload)
        return response.created({ user })
    }
}
