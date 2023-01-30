import express from 'express'
import { app } from './handler/handler'

const port = parseInt(process.env.PORT) || 8080

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`)
})
