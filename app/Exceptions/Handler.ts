import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@adonisjs/core/build/standalone'

export default class ExceptionHandler extends HttpExceptionHandler {
    constructor() {
        super(Logger)
    }

    public async handle(error: Exception, ctx: HttpContextContract): Promise<any> {
        if(error.status === 422) {
            return ctx.response.status(error.status).send({
                code: 'BAD_REQUEST',
                message: error.message,
                status: error.status,
                errors: error.messages?.errors ? error.messages.errors : ''
            })    
        }

        else if(error.code === 'E_ROW_NOT_FOUND') {
            return ctx.response.status(error.status).send({
                code: 'BAD_REQUEST',
                message: 'Resource not found',
                status: 404
            })
        }

        return super.handle(error, ctx)
    }
}
