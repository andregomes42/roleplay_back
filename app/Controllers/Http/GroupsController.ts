import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Group from 'App/Models/Group'
import StoreGroup from 'App/Validators/StoreGroupValidator'

export default class GroupsController {
    public async store({ request, response, auth }: HttpContextContract) {
        const payload = await request.validate(StoreGroup)
        const group = await Group.create({
            master_id: auth.user?.id,
            name: payload.name,
            chronic: payload.chronic,
            schedule: payload.schedule,
            location: payload.location,
            description: payload.description
        })
        
        return response.created(group)
    }
}
