import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Dungeon from 'App/Models/Dungeon'
import DungeonService from 'App/Services/DungeonService'
import StoreDungeon from 'App/Validators/StoreDungeonValidator'
import UpdateDungeon from 'App/Validators/UpdateDungeonValidator'

export default class DungeonsController {
    public async index({ request, response, auth }: HttpContextContract) {
        const user_id = auth.user!.id
        const perPage = request.input('perPage', 1)

        const dungeons = await DungeonService.index(user_id, perPage)
        
        return response.ok(dungeons)
    }

    public async store({ request, response, auth }: HttpContextContract) {
        const payload = await request.validate(StoreDungeon)
        
        const dungeon = await DungeonService.store(payload, auth.user!.id)

        return response.created(dungeon)
    }

    public async update({ request, response, bouncer }: HttpContextContract) {
        const dungeon_id = request.param('dungeon')
        const payload = await request.validate(UpdateDungeon)

        let dungeon = await Dungeon.findOrFail(dungeon_id)

        await bouncer.authorize('dungeon_admin', dungeon)

        dungeon = await DungeonService.update(payload, dungeon)

        return response.ok(dungeon)
    }

    public async destroy({ request, response, bouncer }: HttpContextContract) {
        const dungeon_id = request.param('dungeon')

        const dungeon = await Dungeon.findOrFail(dungeon_id)
        await bouncer.authorize('dungeon_admin', dungeon)

        await dungeon.delete()
        return response.noContent()
    }

    public async removePlayer({ request, response, bouncer }: HttpContextContract) {
        const dungeon_id = request.param('dungeon')
        const player_id = Number(request.param('player'))

        let dungeon = await Dungeon.query().whereHas('players', (query) => {
            query.where('id', player_id)
        }).andWhere('id', dungeon_id).preload('players').firstOrFail()

        await bouncer.authorize('dungeon_admin', dungeon)

        dungeon = await DungeonService.removePlayer(dungeon, player_id)
        
        return response.ok(dungeon)
    }
}
