import BadRequest from 'App/Exceptions/BadRequestException';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Dungeon from 'App/Models/Dungeon'
import DungeonRequest from 'App/Models/DungeonRequest'
import DungeonRequestService from 'App/Services/DungeonRequestService';
import UpdateRequestValidator from 'App/Validators/UpdateRequestValidator';

export default class DungeonsRequestsController {
    public async index({ request, response, auth, bouncer }: HttpContextContract) {
        const dungeon_id = request.param('dungeon')
        const user_id = auth.user!.id

        const dungeon = await Dungeon.findOrFail(dungeon_id)
        await bouncer.authorize('dungeon_admin', dungeon)

        const solicitations = await DungeonRequestService.index(user_id, dungeon_id)
        
        return response.ok(solicitations)
    }

    public async store({ request, response, auth }: HttpContextContract) {
        const dungeon_id = request.param('dungeon')
        const user_id = auth.user!.id

        await Dungeon.findOrFail(dungeon_id)
        
        const dungeon_request = await DungeonRequestService.store(user_id, dungeon_id)

        return response.created(dungeon_request)
    }
    
    public async update({ request, response, bouncer }: HttpContextContract) {
        const { status } = await request.validate(UpdateRequestValidator)

        const dungeon_request_id = request.param('dungeon_request')

        let dungeon_request = await DungeonRequest.findOrFail(dungeon_request_id)

        await dungeon_request.load('dungeon', (query) => {
            query.select('id', 'master_id')
        })

        await bouncer.authorize('answer_request', dungeon_request)

       dungeon_request = await DungeonRequestService.update(dungeon_request, status)

        return response.ok(dungeon_request)
    }
}
