import type { Request, Response} from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
    
    static findMemberByEmail = async (req:Request, res: Response) => {
        const { email } = req.body
        
        //Buscar usuario
        const user = await User.findOne({email}).select('id email name')
        
        if(!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }
        res.json(user)
    }

    //Miembros del proyecto
    static getProjectTeam = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id email name'
        })
        res.json(project.team)
    }

    //Agrega un miembro al proyecto
    static addMemberById = async (req:Request, res: Response) => {
       const { id } = req.body
        //Buscar usuario
        const user = await User.findById(id).select('id')
        
        if(!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }

        if(req.project.team.some(team => team.toString() === user.id.toString() )) {
            const error = new Error('El usuario ya existe en el proyecto')
            return res.status(409).json({error: error.message})
        }
        req.project.team.push(user.id)
        await req.project.save()

        res.json('Usuario agregado correctamente')
    }

    //Elimina a un usuario del equipo
    static removeMemberById = async (req:Request, res: Response) => {
        const { userId } = req.params

        //Comprueba si el usuario existe en el proyecto
        if(!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('El usuario no es parte del proyecto')
            return res.status(409).json({error: error.message})
        }

        //Quita el id al proyecto
        req.project.team = req.project.team.filter( teamMember => teamMember.toString() !== userId)        
        await req.project.save() //Guarda los cambios
        res.send('Usuario eliminado correctamente')
    }


}