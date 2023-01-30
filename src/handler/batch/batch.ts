import { Express } from 'express'

export const batchHandler = (app: Express) => {
  //app.use("/batch");
  app.get('/batch/ping', (req, res) => {
    res.send('pong')
  })
}
