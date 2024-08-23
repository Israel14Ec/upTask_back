import type {Request, Response } from 'express'
import Task from '../models/Task'

export class TaskController {

    static createTask = async (req: Request, res: Response) => {
        try {

            const task = new Task(req.body)
            task.project = req.project.id //Agrego el id del proyecto a la tarea
            req.project.tasks.push(task.id) //Agrego el id de la tarea al proyecto

            //Todos los promiseses se ejecutan
            await Promise.allSettled([
                task.save(),
                req.project.save()
            ])
            
            return res.send('Tarea creada correctamente')
        
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({project: req.project.id}).populate('project')
            return res.json(tasks)

        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await req.task
                .populate([
                    { path: 'completedBy.user', select: 'id name email' },
                    { path: 'notes', populate: {path: 'createBy', select: 'id name email'} }
                ])
        
            res.json(task)

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()

            return res.send("Tarea actualizada correctamente")

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {

            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id) //Saca del array las tareas
            
            await Promise.allSettled([
                req.task.deleteOne(), //Elimina documento de tareas
                req.project.save() //Actualiza de project la tarea
            ])
            return res.send("Tarea eliminada correctamente")
            
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    //Actualizar el estado, tambien guarda un registro de los cambios x usuario
    static updateStatus = async (req: Request, res: Response) => {
        try {

            const { status } = req.body
            req.task.status = status

            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data) //Añade al documento
            await req.task.save()
            res.send('Tarea actualizada')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}