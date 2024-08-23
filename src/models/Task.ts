import mongoose, {Schema, Document, Types} from "mongoose";
import Note from "./Note";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const //tIPO DE ASERTACIÓN DE TS, PARA QUE SEAN SOLO DE LECTURA


export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

export interface ITask extends Document {
    name: string
    description: string
    project: Types.ObjectId
    status: TaskStatus
    completedBy: {
        user: Types.ObjectId,
        status: TaskStatus
    }[]
    notes: Types.ObjectId[]
}

export const TaskSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project' //Referencia del documento
    },
    status: {
        type: String,
        enum: Object.values(taskStatus), //Restringe los valores que se pueden tomar
        default: taskStatus.PENDING
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus), //Restringe los valores que se pueden tomar
                default: taskStatus.PENDING
            },
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]
}, {timestamps: true})


//Midleware: acciones que se ejecutan antes o despues
TaskSchema.pre('deleteOne', {document: true}, async function () { //Docuemnto retorna la información del documento que eliminas
   // console.log(this._id) //This es el documento a ser eliminado, con un arrow function no se puede asignar en this el contexto
    const taskId = this._id
    if(!taskId) return
    await Note.deleteMany({task: taskId}) //Borra todas las notas
}) //Antes de que se ejecute el deleteOne

const Task = mongoose.model<ITask>('Task', TaskSchema)
export default Task