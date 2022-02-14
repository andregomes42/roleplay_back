import ForgotPassword from 'App/Validators/ForgotPasswordValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import ResetPassword from 'App/Validators/ResetPasswordValidator'

export default class PasswordsController {
    public async forgot({request, response}: HttpContextContract) {
        const { email, resetPasswordUrl } = await request.validate(ForgotPassword)
        const user = await User.findByOrFail('email', email)

        const random = await promisify(randomBytes)(24)
        const token = random.toString('hex')
        await user.related('tokens').updateOrCreate({userId: user.id}, {token}) 
        
        const resetPasswordUrlWithToken = `${resetPasswordUrl}?token=${token}`
        await Mail.send((message) => {
            message.from('no-reply@roleplay.com').to(email)
            .subject('Roleplay: Reset password').htmlView('emails/forgot_password', {
                productName: 'Roleplay',
                name: user.username,
                resetPasswordUrl: resetPasswordUrlWithToken
            })
        })
        
        return response.noContent()
    }

    public async reset({request, response}: HttpContextContract) {
        const { token, password } = await request.validate(ResetPassword)
        const user = await User.query().whereHas('tokens', (query) => {
            query.where('token', token)
        }).preload('tokens').firstOrFail()

        user.password = password
        await user.save()
        await user.tokens[0].delete()
        
        return response.noContent()
    }
}
