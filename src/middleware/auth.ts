import { Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'


declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async(req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    
    //Comprobar que se mando el bearer
    if(!bearer) {
        const error = new Error('No autorizado')
        return res.status(401).json({error: error.message})
    }

    const token = bearer.split(' ')[1] //Saca el valor del token sin el bearer

    //Verificar JWT
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        if(typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id).select('_id name email')
            
            if(user) {
                //se escribe en el request para pasar del middleware al controller
                req.user = user
            } else {
                res.status(404).json({error: 'JWT no válido'})
            }
        
        }

        next()

    } catch (error) {
        res.status(500).json({error: 'JWT no válido'})
    }

}