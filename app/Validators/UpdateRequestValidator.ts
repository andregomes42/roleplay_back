import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RequestStatus } from 'App/Utils/DefaultData'

export default class UpdateRequestValidator {
  status_type = RequestStatus.status

  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    status: schema.enum(this.status_type, [rules.required()])
  })

  public messages = {}
}
