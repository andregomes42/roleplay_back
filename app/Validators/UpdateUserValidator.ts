import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  user_id = this.ctx.auth.user!.id

  public schema = schema.create({
    email: schema.string.optional({}, [rules.email(), rules.unique({ table: 'users', column: 'email', whereNot: { id: this.user_id } })]),
    avatar: schema.string.optional({}, [rules.url()]),
    username: schema.string.optional({}, [rules.minLength(3), rules.unique({ table: 'users', column: 'username', whereNot: { id: this.user_id } })]),
    password: schema.string.optional({}, [rules.minLength(3)])
  })

  public messages = {}
}
