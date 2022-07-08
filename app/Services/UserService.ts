import Database from "@ioc:Adonis/Lucid/Database";
import { ModelPaginatorContract } from "@ioc:Adonis/Lucid/Orm";
import User from "App/Models/User";

type UserType = {
    email?: string
    avatar?: string
    username?: string
    password?: string
}

class UserService {
    public async index(search: string, page: number, perPage: number): Promise<ModelPaginatorContract<User>> {
        const query = User.query().if(search, (subQuery) => {
            subQuery.where('username', 'ILIKE', `%${search}%`)
        })
        
        return await query.paginate(page, perPage)
    }

    public async create(payload: UserType): Promise<User> {
        const trx = await Database.transaction()
        const user = User.create(payload)
        await trx.commit()

        return user
    }

    public async update(payload: UserType, user: User): Promise<User> {
        const trx = await Database.transaction()
        await user.merge(payload).save()
        await trx.commit()

        return user
    }
}

export default new UserService()