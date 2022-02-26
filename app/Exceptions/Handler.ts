import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@adonisjs/core/build/standalone'

export default class ExceptionHandler extends HttpExceptionHandler {
    constructor() {
        super(Logger)
    }

    public async handle(error: Exception, ctx: HttpContextContract): Promise<any> {
        if(['E_INVALID_AUTH_UID', 'E_INVALID_AUTH_PASSWORD'].includes(error.code)) {
            return ctx.response.status(error.status).send({
                code: 'BAD_REQUEST',
                message: 'Invalid credentials',
                status: 400
            })
        }
        
        if(error.code === 'E_UNAUTHORIZED_ACCESS') {
            return ctx.response.status(error.status).send({
                code: 'UNAUTHORIZED_ACCESS',
                message: 'Unauthorized access',
                status: 401
            })
        }

        if(error.code === 'E_AUTHORIZATION_FAILURE') {
            return ctx.response.status(error.status).send({
                code: 'FORBIDDEN_ACCESS',
                message: 'Forbidden access',
                status: 403
            })
        }
        
        if(error.status === 422) {
            return ctx.response.status(error.status).send({
                code: 'BAD_REQUEST',
                message: error.message,
                status: error.status,
                errors: error.messages?.errors ? error.messages.errors : ''
            })    
        }

        if(error.code === 'E_ROW_NOT_FOUND') {
            return ctx.response.status(error.status).send({
                code: 'BAD_REQUEST',
                message: 'Resource not found',
                status: 404
            })
        }

        return super.handle(error, ctx)
    }
}
