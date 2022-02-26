import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  
  @column({ columnName: 'master_id' })
  public master_id: number

  @column()
  public name: string

  @column()
  public chronic: string

  @column()
  public schedule: string

  @column()
  public location: string

  @column()
  public description: string

  @belongsTo(() => User, { foreignKey: 'master_id' })
  public master: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
