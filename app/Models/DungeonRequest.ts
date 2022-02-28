import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Dungeon from './Dungeon'
import User from './User'

export default class DungeonRequest extends BaseModel {
  public static table = 'dungeons_requests'
  
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public dungeon_id: number

  @column()
  public status: string

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Dungeon, { foreignKey: 'dungeon_id' })
  public dungeon: BelongsTo<typeof Dungeon>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
