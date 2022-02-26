import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Login from 'App/Validators/LoginValidator'

export default class AuthController {
    public async login({request, response, auth}: HttpContextContract) {
        const { email, password } = await request.validate(Login)
        const token = await auth.use('api').attempt(email, password, { expiresIn: '2hours' })

        return response.created({ user: auth.user, token })
    }
}
