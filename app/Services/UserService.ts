import User from "App/Models/User";

type UserType = {
    email?: string
    avatar?: string
    username?: string
    password?: string
}

class UserService {
    public async create(payload: UserType): Promise<User> {
        return User.create(payload)
    }

    public async update(payload: UserType, user: User): Promise<User> {
        payload.email ? user.email = payload.email : false
        payload.avatar ? user.avatar = payload.avatar : false
        payload.username ? user.username = payload.username : false
        payload.password ? user.password = payload.password : false
        await user.save()

        return user
    }
}

export default new UserService()