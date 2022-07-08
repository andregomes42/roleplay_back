import Database from "@ioc:Adonis/Lucid/Database";
import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import TokenExpired from 'App/Exceptions/TokenExpiredException'



class PasswordService {
    public async forgot(user: User, url: string) {
        const trx = await Database.transaction()

        const random = await promisify(randomBytes)(24)
        const token = random.toString('hex')
        await user.related('tokens').updateOrCreate({ user_id: user.id }, { token }) 
        
        const resetPasswordUrlWithToken = `${ url }?token=${ token }`
        await Mail.send((message) => {
            message.from('no-reply@roleplay.com').to(user.email)
            .subject('Roleplay: Reset password').htmlView('emails/forgot_password', {
                productName: 'Roleplay',
                name: user.username,
                resetPasswordUrl: resetPasswordUrlWithToken
            })
        })

        await trx.commit()
    }

    public async reset(user: User, password: string){
        const trx = await Database.transaction()

        const tokenAge = Math.abs(user.tokens.at(0)?.createdAt.diffNow('hours').hours)
        if(tokenAge > 2)
            throw new TokenExpired()

        await user.merge({ password }).save()
        await user.tokens.at(0)?.delete()

        await trx.commit()
    }
}

export default new PasswordService()