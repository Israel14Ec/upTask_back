import { Router } from 'express'
import { body, param } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputError } from '../middleware/validation'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/create-account', 
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('password')
        .isLength({ min: 8}).withMessage('El password es muy corto, debe ingresar mínimo 8 caracteres')
        .notEmpty().withMessage('El password es obligatorio'),
    //Compara con el password ingresado
    body('password_confirmation').custom((value, {req })=> {
        if(value !== req.body.password) {
            throw new Error('Los password no son iguales')
        }
        return true
    }),
    body('email')
        .isEmail().withMessage('Debe tener un formato de email')
        .notEmpty().withMessage('Debe ingresar un email'),
    handleInputError,
    AuthController.createAccount
)

router.post('/confirm-account', 
    body('token')
        .notEmpty().withMessage('Se debe ingresar un token'),
    handleInputError,
    AuthController.confirmAccount
)

router.post('/login', 
    body('email')
        .isEmail().withMessage('Debe tener un formato de email')
        .notEmpty().withMessage('Debe ingresar un email'),
    body('password')
        .notEmpty().withMessage('El password es obligatorio'),
    handleInputError,
    AuthController.login
)

router.post('/request-code', 
    body('email')
        .isEmail().withMessage('Debe tener un formato de email')
        .notEmpty().withMessage('Debe ingresar un email'),
    handleInputError,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password', 
    body('email')
        .isEmail().withMessage('Debe tener un formato de email')
        .notEmpty().withMessage('Debe ingresar un email'),
    handleInputError,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('El token no puede ser vacío'),
    handleInputError,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token no válido'),
    body('password')
        .isLength({ min: 8}).withMessage('El password es muy corto, debe ingresar mínimo 8 caracteres')
        .notEmpty().withMessage('El password es obligatorio'),
    //Compara con el password ingresado
    body('password_confirmation').custom((value, {req })=> {
        if(value !== req.body.password) {
            throw new Error('Los password no son iguales')
        }
        return true
    }),
    handleInputError,
    AuthController.updatePasswordWithtToken
)

router.get('/user', 
    authenticate,
    AuthController.user
)

/** Profile */
router.put('/profile',
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('email')
        .isEmail().withMessage('Debe tener un formato de email'),
    handleInputError,
    AuthController.updateProfile
)

router.post('/update-password', 
    authenticate,
    body('current_password')
        .notEmpty().withMessage('Se debe mandar el password actual'),
    body('password')
        .isLength({ min: 8}).withMessage('El password es muy corto, debe ingresar mínimo 8 caracteres')
        .notEmpty().withMessage('El password es obligatorio'),
    //Compara con el password ingresado
    body('password_confirmation').custom((value, {req })=> {
        if(value !== req.body.password) {
            throw new Error('Los password no son iguales')
        }
        return true
    }),
    handleInputError,
    AuthController.updateCurrenUserPassword
)

router.post('/check-password', 
    authenticate,
    body('password')
        .notEmpty().withMessage('Se necesita ingresar el password'),
    handleInputError,
    AuthController.checkPassword
)

export default router
