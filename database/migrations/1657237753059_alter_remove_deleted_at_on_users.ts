import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterAddDeletedAtOnUsers extends BaseSchema {
    protected tableName = 'users'

    public async up () {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('deleted_at')
        })
    }

    public async down () {
        this.schema.alterTable(this.tableName, (table) => {
            table.timestamp('deleted_at', { useTz: true }).nullable()
        })
    }
}
