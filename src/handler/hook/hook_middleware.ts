import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { loadConfig } from '../../config/config'

export const hookMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const conf = loadConfig()
  const auth = req.headers['authorization']
  console.log(`auth: ${auth}`)

  if (auth == null) return res.sendStatus(401)

  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.error(`invalid auth header: ${parts}`)
    res.sendStatus(403)
  }
  const token = parts[1]
  console.log(`token: ${token}`)

  try {
    const decoded = jwt.verify(token, conf.jwtSecret)
    next()
  } catch (err) {
    console.error(`jwt verify: ${err}`)
    return res.sendStatus(403)
  }
}
