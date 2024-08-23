import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whiteList = [
            process.env.FRONTEND_URL
        ]

        if(process.argv[2] === '--api'){ //Busca el argumento --api para aceptar peticiones desde Postman
            whiteList.push(undefined)
        }
        if(whiteList.includes(origin)) {
            callback(null, true) //El primer parametro es un error, el segundo permite la conexión
        } else {
            callback(new Error('Error de CORS'))
        }
    }
}