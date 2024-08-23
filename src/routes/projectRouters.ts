import { Router } from 'express'
import { ProjectController } from '../controllers/ProjectControllers'
import { body, param } from 'express-validator'
import { handleInputError } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { projectExist } from '../middleware/project'
import { hasAuthorization, taskBelongsToProject, taskExist } from '../middleware/task'
import { authenticate } from '../middleware/auth'
import { TeamMemberController } from '../controllers/TeamController'
import { NoteController } from '../controllers/NoteController'

const router = Router()

//-------------------------- RUTAS DEL PROYECTO ---------------

router.use(authenticate) //En todas las rutas se usa el authenticate
router.param('projectId', projectExist) //Se ejecuta en cualquier ruta que tenga el parametro projectId

//Crea el proyecto
router.post('/', 
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El cliente es obligatorio'),

    body('description')
        .notEmpty().withMessage('La descripción es obligatorio'),
    handleInputError, //Middleware
    ProjectController.createProject)

//Obtiene todos los proyectos
router.get('/', ProjectController.getAllProjects)

//Obtiene por el id
router.get('/:id', 
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputError,
    ProjectController.getProjectById)

router.put('/:projectId',
    param('projectId').isMongoId().withMessage('ID no válido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El cliente es obligatorio'),

    body('description')
        .notEmpty().withMessage('La descripción es obligatorio'),
    handleInputError,
    ProjectController.updateProject
)

router.delete('/:projectId', //al usar la ruta /:projectId se valida que el projectId exista
    param('projectId').isMongoId().withMessage('ID no válido'),
    handleInputError,
    hasAuthorization, //Valida que este autorizado el suuario
    ProjectController.deleteProject
)

/** ------------------------------RUTAS DE TAREAS */

router.param('taskId', taskExist) //Handler
router.param('taskId', taskBelongsToProject) 

router.post('/:projectId/tasks',  //Nested Resource Routing, patron de disesño para APIs RESTful
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatorio'),
    handleInputError, //Middleware
    TaskController.createTask
)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputError,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatorio'),

    handleInputError,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputError,
    TaskController.deleteTask
)


router.post('/:projectId/tasks/:taskId/status',
    body('status')
        .notEmpty().withMessage('El estado es obligatorio'),

    handleInputError,
    TaskController.updateStatus
)

/** Rutas para agregar equipo al proyecto */
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('Email no válido'),
    handleInputError,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
   TeamMemberController.getProjectTeam
)

router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputError,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('ID no válido'),
    handleInputError,
    TeamMemberController.removeMemberById
)



/** Routas para Notas */
router.post('/:projectId/tasks/:taskId/notes', 
    body('content')
        .notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputError,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id no válido'),
    handleInputError,
    NoteController.deleteNote
)

export default router