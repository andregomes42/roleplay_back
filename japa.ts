import 'reflect-metadata'
import { join } from 'path'
import getPort from 'get-port'
import { configure } from 'japa'
import sourceMapSupport from 'source-map-support'
import execa from 'execa'

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(__dirname)
sourceMapSupport.install({ handleUncaughtExceptions: false })

async function runMigrations() {
  execa.node('ace', ['migration:run'], {
    stdio: 'inherit'
  })
}

async function rollbackMigrations() {
  execa.node('ace', ['migration:rollback'], {
    stdio: 'inherit'
  })
}

async function startHttpServer() {
  const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
  process.env.PORT = String(await getPort())
  await new Ignitor(__dirname).httpServer().start()
}

/**
 * Configure test runner
 */
configure({
  files: ['tests/**/*.spec.ts'],
  before: [runMigrations, startHttpServer],
  after: [rollbackMigrations]
})