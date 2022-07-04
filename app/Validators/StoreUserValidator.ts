import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
    avatar: schema.string.optional({}, [rules.url()]),
    username: schema.string({}, [rules.minLength(3), rules.unique({ table: 'users', column: 'username' })]),
    password: schema.string({}, [rules.minLength(3)])
  })

  public messages = {
    'email.unique': 'email is arealdy in use',
    'username.unique': 'username is arealdy in use'
  }
}
