import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Dungeon from './Dungeon'
import User from './User'

export default class Player extends BaseModel {
  public static table = 'dungeons_users'

  @column({ isPrimary: true })
  public user_id: number

  @column({ isPrimary: true })
  public dungeon_id: number

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Dungeon, { foreignKey: 'dungeon_id' })
  public dungeon: BelongsTo<typeof Dungeon>
}
