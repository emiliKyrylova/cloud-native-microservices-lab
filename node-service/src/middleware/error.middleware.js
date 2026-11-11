const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || "internal_server_error";

    res.status(statusCode).json({
        error: errorCode,
        message: err.message || "An unexpected error occurred"
    });
};
module.exports = errorHandler;