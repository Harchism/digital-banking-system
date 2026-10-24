function errorHandler(err, req, res, next) {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
