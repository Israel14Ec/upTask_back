import bcrypt from 'bcrypt'

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10) //Salt para hashear el password
    return await bcrypt.hash(password, salt) //hashea el password y retorna el hash
}

export const checkPassword = async (enteredPassword: string, storedHash: string) => {
    //Retorna true o false si son iguales es una operacion costosa por eso el await
    return await bcrypt.compare(enteredPassword, storedHash) 
}