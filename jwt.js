const jwt =require('jsonwebtoken')
const secretJWT = 'test-prueba-palabra'
const generarJWT = (payload)=>{
    return new Promise((resolve,reject) => {
        jwt.sign(
            payload,
            secretJWT,
            {expiresIn: '2h'},
            (err,token) =>{
                if(err){
                    console.log(err)
                    reject('No se genero el token')
                }
                resolve(token)
            }
        )
    })
}

module.exports = {
    generarJWT
}