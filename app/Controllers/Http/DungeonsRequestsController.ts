import BadRequest from 'App/Exceptions/BadRequestException';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Dungeon from 'App/Models/Dungeon'
import DungeonRequest from 'App/Models/DungeonRequest'

export default class DungeonsRequestsController {
    public async index({ request, response, auth }: HttpContextContract) {
        const dungeon_id = request.param('dungeon')
        const user_id = auth.user!.id

        const dungeon = await Dungeon.findOrFail(dungeon_id)
        if(dungeon.master_id !== user_id) throw new BadRequest('Resource not found', 404)

        const solicitation = await DungeonRequest.query().whereHas('dungeon', (query) => {
            query.where('master_id', user_id).andWhere('id', dungeon_id)
        }).where('status', 'pending')

        return response.ok(solicitation)
    }

    public async store({ request, response, auth }: HttpContextContract) {
        const dungeon_id = request.param('dungeon')
        const user_id = auth.user!.id

        await Dungeon.findOrFail(dungeon_id)
        
        const solicitation = await DungeonRequest.query().where('dungeon_id', dungeon_id).andWhere('user_id', user_id).first()
        if(solicitation) throw new BadRequest('Dungeon request already exists', 409)
        
        const user_dungeons = await Dungeon.query().whereHas('players', (query) => {
            query.where('id', user_id)
        }).andWhere('id', dungeon_id).first()
        if(user_dungeons) throw new BadRequest('User is already in the dungeon', 409)

        const dungeon_request = await DungeonRequest.create({ user_id, dungeon_id })
        await dungeon_request.refresh()

        return response.created(dungeon_request)
    }
    
    public async update({ request, response, bouncer }: HttpContextContract) {
        const { status } = request.qs()
        const dungeon_request_id = request.param('dungeon_request')

        const dungeon_request = await DungeonRequest.findOrFail(dungeon_request_id)

        await dungeon_request.load('dungeon', (query) => {
            query.select('id', 'master_id')
        })

        await dungeon_request.merge({ status }).save()     

        if(status === 'accepted') 
            await dungeon_request.dungeon.related('players').attach([ dungeon_request.user_id ])

        return response.ok(dungeon_request)
    }
}
