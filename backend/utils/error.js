export const errorHandler = (statusCode, massege) =>{
    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
}