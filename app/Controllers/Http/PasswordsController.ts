import ForgotPassword from 'App/Validators/ForgotPasswordValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export default class PasswordsController {
    public async forgot({request, response}: HttpContextContract) {
        const { email, resetPasswordUrl } = await request.validate(ForgotPassword)
        const user = await User.findByOrFail('email', email)
        
        await Mail.send((message) => {
            message.from('no-reply@roleplay.com').to(email)
            .subject('Roleplay: Reset password').htmlView('emails/forgot_password', {
                productName: 'Roleplay',
                name: user.username,
                resetPasswordUrl,
            })
        })
        
        return response.noContent()
    }
}
