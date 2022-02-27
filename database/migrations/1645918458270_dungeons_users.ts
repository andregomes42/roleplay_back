import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DungeonsUsers extends BaseSchema {
  protected tableName = 'dungeons_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['user_id', 'dungeon_id']),
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('dungeon_id').unsigned().references('id').inTable('dungeons').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
