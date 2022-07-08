import ForgotPassword from 'App/Validators/ForgotPasswordValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import ResetPassword from 'App/Validators/ResetPasswordValidator'
import PasswordService from 'App/Services/PasswordService'

export default class PasswordsController {
    public async forgot({ request, response }: HttpContextContract) {
        const { email, resetPasswordUrl } = await request.validate(ForgotPassword)
        const user = await User.findByOrFail('email', email)

        await PasswordService.forgot(user, resetPasswordUrl)

        return response.noContent()
    }

    public async reset({ request, response }: HttpContextContract) {
        const { token, password } = await request.validate(ResetPassword)
        const user = await User.query().whereHas('tokens', (query) => {
            query.where('token', token)
        }).preload('tokens').firstOrFail()

        await PasswordService.reset(user, password)

        return response.noContent()
    }
}
