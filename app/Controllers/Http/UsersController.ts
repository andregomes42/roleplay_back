import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StoreUser from 'App/Validators/StoreUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'
import UserService from 'App/Services/UserService'
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

export default class UsersController {
    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(StoreUser)

        const user = await UserService.create(payload)
        return response.created(user)
    }

    public async update({ request, response, bouncer }: HttpContextContract) {
        const payload = await request.validate(UpdateUser)

        let user = await User.query().where('id', request.param('user')).andWhereNull('deleted_at').firstOrFail()
        await bouncer.authorize('check_user', user)

        user = await UserService.update(payload, user)

        return response.ok(user)
    }

    public async show({ request, response }: HttpContextContract) {
        let user = await User.query().where('id', request.param('user')).andWhereNull('deleted_at').firstOrFail()

        return response.ok(user)
    }

    public async destroy({ request, response, bouncer }: HttpContextContract) {
        let user = await User.query().where('id', request.param('user')).andWhereNull('deleted_at').firstOrFail()
        await bouncer.authorize('check_user', user)

        const trx = await Database.transaction()
        await user.merge({ deleted_at: DateTime.local() }).save()
        await trx.commit()

        return response.noContent()
    }
}
