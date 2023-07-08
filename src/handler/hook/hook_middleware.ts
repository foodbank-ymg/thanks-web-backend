import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { loadConfig } from '../../config/config'

export const hookMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const conf = loadConfig()
  const auth = req.headers['authorization'].split(' ')[1]
  if (auth == null) return res.sendStatus(401)
  if (auth.split(' ')[0] === 'Bearer') res.sendStatus(403)

  try {
    const decoded = jwt.verify(auth, conf.accessToken)
    next()
  } catch (err) {
    console.log(err)
    return res.sendStatus(403)
  }
}
