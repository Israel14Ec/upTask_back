import type {Request, Response} from 'express'
import Project from '../models/Project'

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        try {
            const project = new Project(req.body)
            
            //Asigna un manager
            project.manager = req.user.id
            await project.save()
            return res.send('Proyecto creado correctamente') //Devuelve un mensaje
        } catch (error) {
            console.log(error)
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
       try {
        const projects = await Project.find({
            $or: [//El or permite escribir mutiples condiciones
                {manager: {$in: req.user.id}},
                { team: {$in: req.user.id}}
            ]   
            
        })
        res.json(projects) //Devuelve un json

       } catch (error) {
        console.log(error)
       }
    }

    //Trae a los proyectos con las tareas
    static getProjectById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const project = await Project.findById(id).populate('tasks')
            
            if(!project) {
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }

            //Valida solo que el manajer pueda entrar
            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)){
                const error = new Error('Acción no válida')
                return res.status(404).json({error: error.message})
            }
            
            res.json(project)

        } catch (error) {
            console.log(error)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        try {
            
            req.project.projectName = req.body.projectName
            req.project.clientName = req.body.clientName
            req.project.description = req.body.description
  
            await req.project.save() //Guarda los cambios

            res.send('Proyecto actualizado')

        } catch (error) {
            console.log(error)
        }
    } 

    static deleteProject = async (req: Request, res: Response) => {
        try {            
            await req.project.deleteOne()
            res.send('Proyecto eliminado')

        } catch (error) {
            console.log(error)
        }
    }
}