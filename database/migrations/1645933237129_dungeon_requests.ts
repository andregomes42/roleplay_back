import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DungeonRequests extends BaseSchema {
  protected tableName = 'dungeons_requests'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('dungeon_id').unsigned().references('id').inTable('dungeons').notNullable()
      table.enum('status', ['pending', 'accepted', 'rejected']).defaultTo('pending').notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
