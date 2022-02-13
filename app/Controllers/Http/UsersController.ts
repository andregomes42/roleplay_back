import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
    public async store({request, response}: HttpContextContract) {
        const payload = request.only(['email', 'password', 'username', 'avatar'])
        const userEmail = await User.findBy('email', payload.email)

        if(userEmail)
            return response.conflict({ message: 'email is arealdy in use'})

        const user = await User.create(payload)
        return response.created({ user })
    }
}
