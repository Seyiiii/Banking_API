export const errorHandler = (err, req, res, next) => {
    console.error("Error caught by middleware:", err.message);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format provided.";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered.";
    }

    res.status(statusCode).json({ error: message });
};