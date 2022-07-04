import Database from "@ioc:Adonis/Lucid/Database";
import Dungeon from "App/Models/Dungeon";
import DungeonRequest from "App/Models/DungeonRequest";
import BadRequest from 'App/Exceptions/BadRequestException';



class DungeonRequestService {
    public async index(user_id: number, dungeon_id: number): Promise<DungeonRequest[]> {
        const solicitations = await DungeonRequest.query().whereHas('dungeon', (query) => {
            query.where('master_id', user_id).andWhere('id', dungeon_id)
        }).where('status', 'pending')

        return solicitations
    }

    public async store(user_id: number, dungeon_id: number): Promise<DungeonRequest> {
        const solicitation = await DungeonRequest.query().where('dungeon_id', dungeon_id).andWhere('user_id', user_id).first()
        if(solicitation) throw new BadRequest('Dungeon request already exists', 409)
        
        const user_dungeons = await Dungeon.query().whereHas('players', (query) => {
            query.where('id', user_id)
        }).andWhere('id', dungeon_id).first()
        if(user_dungeons) throw new BadRequest('User is already in the dungeon', 409)

        const dungeon_request = await DungeonRequest.create({ user_id, dungeon_id })
        await dungeon_request.refresh()

        return dungeon_request
    }

    public async update(dungeon_request: DungeonRequest, status: string): Promise<DungeonRequest> {
        const trx = await Database.transaction()

        await dungeon_request.merge({ status }).save()     

        if(status === 'accepted') 
            await dungeon_request.dungeon.related('players').attach([ dungeon_request.user_id ])

        await trx.commit()

        return dungeon_request
    }

    public async removePlayer(dungeon: Dungeon, player_id: number): Promise<Dungeon> {
        const trx = await Database.transaction()
        
        if(player_id === dungeon.master_id) {
            dungeon = await dungeon.merge({ master_id: dungeon.players.at(1)?.id }).save()
            await dungeon.refresh()
        }
        
        await dungeon.related('players').detach([player_id])
        await dungeon.load('players')

        await trx.commit()
        
        return dungeon
    }
}

export default new DungeonRequestService()