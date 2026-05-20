import express, { type Router } from "express"

import { errorHandlerMiddleware } from "../../src/common/middlewares/error-handler.middleware.js"

export function createRouterApp(router: Router, mountPath: string) {
  const app = express()

  app.use(express.json())

  app.use(mountPath, router)

  app.use(errorHandlerMiddleware)

  return app
}
