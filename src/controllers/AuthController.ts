import type {Request, Response} from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/Auth'
import { generateJWT } from '../utils/jwt'

export class AuthController {

    //Crea la cuenta de usuario
    static createAccount = async(req: Request, res: Response) => {
        try {

            const { password, email } = req.body

            //Comprobar que el email sea unico
            const userExist = await User.findOne({email}) //Busca por el email

            if(userExist) {
                const error = new Error('El usuario ya está registrado')
                return res.status(409).json({error: error.message})
            }
            
            //Crea un usuario
            const user = new User(req.body)
            
            //Hash password
            user.password = await hashPassword(password)
            
            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            
            //Enviar el email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled(
                [
                    user.save(),
                    token.save()
                ]
            )


            res.send('Cuenta creada, revisa tu email para confirmarla')

        } catch (error) {
            res.status(500).send('No se pudo crear la cuenta')
        }
    }

    //Confirma la cuenta del usuario
    static confirmAccount = async(req: Request, res: Response) => {
        try {
            const { token } = req.body
            
            const tokenExist = await Token.findOne({token}) //Busca por el token
            
            if(!tokenExist) {
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExist.user) //Busco al usuario
            user.confirmed = true

            await Promise.allSettled([
                user.save(),
                tokenExist.deleteOne()
            ])
            res.send('Cuenta confirmada correctamente')

        } catch (error) {
            res.status(500).json({
                msg: 'No se pudo crear la cuenta',
                error
            })
        }
    }

    //Autenticar al usuario
    static login = async(req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({email})

            //El usuario existe
            if(!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message}) 
            }

            //El usuario esta confirmado
            if(!user.confirmed) {

                //Manda el token
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                //Enviar el email con el token de confirmación
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ah sido confirmada, hemos enviado un mensaje de confirmación a tu cuenta')
                return res.status(404).json({error: error.message}) 
            }

            //Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error('El password es incorrecto')
                return res.status(401).json({error: error.message}) 
            } 

            const token = generateJWT({id: user.id})
            res.send(token) //Envío el token generado

        } catch (error) {
            res.status(500).json({
                msg: 'No se pudo crear la cuenta',
                error
            })
        }
    } 

    //Solicita un nuevo token
    static requestConfirmationCode = async(req: Request, res: Response) => {
        try {

            const { email } = req.body

            //Buscar que el usuario exista
            const user = await User.findOne({email}) //Busca por el email

            if(!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({error: error.message})
            }

            //Comprobar que el usuario no este confirmado
            if(user.confirmed) {
                const error = new Error('El usuario ya está confirmado')
                return res.status(403).json({error: error.message})
            }
            
            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            
            //Enviar el email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled(
                [
                    user.save(),
                    token.save()
                ]
            )


            res.send('Se envió un nuevo token al email')

        } catch (error) {
            res.status(500).send('No se pudo crear la cuenta')
        }
    }

    
    //Token de reestalecimiento de contraseña
    static forgotPassword = async(req: Request, res: Response) => {
        try {

            const { email } = req.body

            //Buscar que el usuario exista
            const user = await User.findOne({email}) //Busca por el email

            if(!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({error: error.message})
            }

            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save() //Se guarda en el documento de mongo
            
            //Enviar el email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revisa tu email para instrucciones')

        } catch (error) {
            res.status(500).send('No se pudo crear la cuenta')
        }
    }

    //Revisa que el token exista para recuperar la contraseña
    static validateToken = async(req: Request, res: Response) => {
        try {
            const { token } = req.body
                
            const tokenExist = await Token.findOne({token}) //Busca por el token
            if(!tokenExist) {
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }
            
            res.send('Token válido, define tu nuevo password')

        } catch (error) {
            res.status(500).json({
                msg: 'No se pudo crear la cuenta',
                error
            })
        }
    }

    //Actualizar contraseña
    static updatePasswordWithtToken = async(req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body
            const tokenExist = await Token.findOne({token}) //Busca por el token
      
            if(!tokenExist) {
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }
            
            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])

            res.send('El password se modifico correctamente')

        } catch (error) {
            res.status(500).json({
                msg: 'No se pudo crear la cuenta',
                error
            })
        }
    }

    //Obtiene los datos del usuario
    static user= async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    static updateProfile= async (req: Request, res: Response) => {
        
        const { name, email } = req.body
        req.user.name = name
        req.user.email = email

        try {
            const userExist = await User.findOne({email})
            
            if(userExist && userExist.id.toString() !== req.user.id.toString()) {
                const error = new Error('Ese email ya está registrado')
                return res.status(409).json({error: error.message})
            }
            await req.user.save()
            res.send('Perfil actualizado correctamente')

        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static updateCurrenUserPassword= async (req: Request, res: Response) => {
    
        try {
            const { current_password, password, password_confirmation } = req.body

            //Comprobar el password
            const user = await User.findById(req.user.id)
            //Comprueba si el password pasado coincide con el de la DB
            const isPasswordCorrect = await checkPassword(current_password, user.password) 
            if(!isPasswordCorrect) {
                const error = new Error('El password actual es incorrecto')
                return res.status(401).json({error: error.message})
            }

            user.password = await hashPassword(password)
            await user.save()
            res.send('El password se modifico correctamente')


        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        try {
            const { password } = req.body    
            const user = await User.findById(req.user.id)

            //Comprueba si el password pasado coincide con el de la DB
            const isPasswordCorrect = await checkPassword(password, user.password) 
            if(!isPasswordCorrect) {
                const error = new Error('El password actual es incorrecto')
                return res.status(401).json({error: error.message})
            }

            res.send('Password correcto')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

}