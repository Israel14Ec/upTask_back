import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

type UserPayload = {
    id: Types.ObjectId
}
export const generateJWT = (payload: UserPayload ) =>{
    //Sign crea el JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '180d' //Cuando expira el token
    })

    return token
}