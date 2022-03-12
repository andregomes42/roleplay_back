import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Dungeon from 'App/Models/Dungeon'
import StoreDungeon from 'App/Validators/StoreDungeonValidator'
import UpdateDungeon from 'App/Validators/UpdateDungeonValidator'

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

        await dungeon.related('players').attach([ dungeon.master_id ])
        await dungeon.load('players')
        
        return response.created(dungeon)
    }

    public async update({ request, response, bouncer }: HttpContextContract) {
        const dungeon_id = request.param('dungeon')
        const payload = await request.validate(UpdateDungeon)

        let dungeon = await Dungeon.findOrFail(dungeon_id)

        await bouncer.authorize('updateDungeon', dungeon)

        dungeon = await dungeon.merge(payload).save()
        return response.ok(dungeon)
    }

    public async destroy({ request, response, bouncer }: HttpContextContract) {
        let dungeon_id = request.param('dungeon')

        let dungeon = await Dungeon.findOrFail(dungeon_id)
        await bouncer.authorize('updateDungeon', dungeon)

        await dungeon.delete()
        return response.noContent()
    }

    public async removePlayer({ request, response, bouncer }: HttpContextContract) {
        let dungeon_id = request.param('dungeon')
        let player_id = Number(request.param('player'))

        let dungeon = await Dungeon.query().whereHas('players', (query) => {
            query.where('id', player_id)
        }).andWhere('id', dungeon_id).preload('players').firstOrFail()

        await bouncer.authorize('updateDungeon', dungeon)

        if(player_id === dungeon.master_id) {
            dungeon = await dungeon.merge({ master_id: dungeon.players[1].id }).save()
            await dungeon.refresh()
        }

        await dungeon.related('players').detach([player_id])
        await dungeon.load('players')
        return response.ok(dungeon)
    }
}
