import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Dungeon from 'App/Models/Dungeon'
import StoreDungeon from 'App/Validators/StoreDungeonValidator'

export default class DungeonsController {
    public async store({ request, response, auth }: HttpContextContract) {
        const payload = await request.validate(StoreDungeon)
        const dungeon = await Dungeon.create({
            master_id: auth.user?.id,
            name: payload.name,
            chronic: payload.chronic,
            schedule: payload.schedule,
            location: payload.location,
            description: payload.description
        })
        
        return response.created(dungeon)
    }
}
