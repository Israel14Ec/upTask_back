import type { Request, Response, NextFunction } from 'express'
import Project, { ITask } from '../models/Task'
import Task from '../models/Task'

//Declaracion global para agregar en el request el task
declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExist (req: Request, res: Response, next: NextFunction) {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
  
        if(!task) {
            const error = new Error('Tarea no encontrado')
            return res.status(404).json({error: error.message})
        }

        req.task = task
        
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

//Valida que la tarea pertenece a un proyecto
export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
   
    if(req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('No existe esa tarea en este proyecto')
        return res.status(400).json({error: error.message})
    }
    next()
}


//Comprueba la autorización
export async function hasAuthorization (req: Request, res: Response, next: NextFunction) {
   
    if(req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('No se puede mdificar las tareas cuando eres colaborador')
        return res.status(400).json({error: error.message})
    }
    next()
}

