import mongoose, {Schema, Document, PopulatedDoc, Types} from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

//Tipo
export interface IProject extends Document {
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<ITask & Document>[] //PSeudodocumento - Trae la información de tareas
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
}
/**
 * export type ProjectType = Document & {
    projectName: string
    clientName: string
    description: string
}
 */

//Modelo para moongose
const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
    
}, {timestamps:true})

//Midleware de moongose: acciones que se ejecutan antes o despues
ProjectSchema.pre('deleteOne', {document: true}, async function () { //Docuemnto retorna la información del documento que eliminas
    // console.log(this._id) //This es el documento a ser eliminado, con un arrow function no se puede asignar en this el contexto
    const projectId = this._id
    if(!projectId) return
    
    const tasks = await Task.find({project: projectId}) //Busco las tareas que pertenecen al proyecto
    for(const task of tasks) {
        await Note.deleteMany({task: task._id})
    }
    await Task.deleteMany({project: projectId}) //Borra todas las tareas
 }) //Antes de que se ejecute el deleteOne


//Definir modelo de moongose
 const Project = mongoose.model<IProject>('Project', ProjectSchema)
 export default Project