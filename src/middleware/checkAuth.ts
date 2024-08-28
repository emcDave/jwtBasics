// src/middleware/authMiddleware.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '..';
import { UserModel } from '../db/user';

interface Token {
    username: string;
    csrfToken:string,
    exp:number
  }
export async function CheckAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
   console.log("i was called")
   const headerCSRFToken = req.headers["x-csrf-token"]
   console.log("headder",headerCSRFToken)
    const jwtToken = req.cookies['APP_AUTH'];
    console.log("jwt",jwtToken)
    const validateErrorPre = 'VALIDATE.ERROR.CHECK_AUTH.';

    if (!jwtToken) {
      res.status(401);
      throw new Error(`${validateErrorPre}MISSING_AUTHEN_TOKEN`);
    }
    if (!headerCSRFToken) {
        res.status(401)
        throw Error("CSRF token required");
    }

    const decoded = jwt.verify(jwtToken, SECRET_KEY) as Token
    console.log(decoded)
    const user = await UserModel.findOne({ username: decoded.username});
console.log(user)
    if (!user) {
      res.status(401);
      throw new Error('Invalid access token');
    }

    const now = new Date().getTime();
    const expDate = new Date(decoded.exp * 1000).getTime();

    if (expDate < now) {
      res.status(401);
      throw new Error('Token expired');
    }
console.log(decoded.csrfToken )
console.log(headerCSRFToken )
    if (decoded.csrfToken !== headerCSRFToken) {
        res.status(401)
        throw Error("Bad CSRF token")
    }
    next();
  } catch (error) {
    
    console.error("Error in CheckAuth middleware:", error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
