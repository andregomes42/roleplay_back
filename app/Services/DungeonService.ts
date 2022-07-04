import Database from "@ioc:Adonis/Lucid/Database";
import { ModelPaginatorContract } from "@ioc:Adonis/Lucid/Orm";
import Dungeon from "App/Models/Dungeon";

type DungeonsType =  {
    name?: string;
    chronic?: string;
    schedule?: string;
    location?: string;
    description?: string;
}


class DungeonService {
    public async index(user_id: number, perPage: number): Promise<ModelPaginatorContract<Dungeon>> {
        const query = Dungeon.query().whereHas('players', query => {
            query.where('id', user_id)
        })
        
        const dungeons = await query.preload('master').paginate(perPage, 5)
        return dungeons
    }

    public async store(payload: DungeonsType, user_id: number): Promise<Dungeon> {
        const trx = await Database.transaction()

        const dungeon = await Dungeon.create({
            master_id: user_id,
            ...payload
        })

        await dungeon.related('players').attach([ dungeon.master_id ])
        await dungeon.load('players')

        await trx.commit()

        return dungeon
    }

    public async update(payload: DungeonsType, dungeon: Dungeon): Promise<Dungeon> {
        const trx = await Database.transaction()

        dungeon = await dungeon.merge(payload).save()

        await trx.commit()

        return dungeon
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

export default new DungeonService()