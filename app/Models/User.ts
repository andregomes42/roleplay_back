import Dungeon from 'App/Models/Dungeon';
import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import LinkToken from './LinkToken'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public username: string

  @column()
  public avatar: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @column.dateTime()
  public deleted_at: DateTime

  @hasMany(() => LinkToken, { foreignKey: 'user_id' })
  public tokens: HasMany<typeof LinkToken>

  @manyToMany(() => Dungeon, { pivotTable: 'dungeons_users' })
  public dungeons: ManyToMany<typeof Dungeon>

  @beforeSave()
  public static async hashPassword(user: User) {
    if(user.$dirty.password)
      user.password = await Hash.make(user.password)
  }
}
