import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
    public async store({request, response}: HttpContextContract) {
        const payload = request.only(['email', 'password', 'username', 'avatar'])
        const user = await User.create(payload)

        return response.created({ user })
    }
}
