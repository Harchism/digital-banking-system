const express = require("express");
const onboardingRoutes = require("./routes/onboarding.routes");
const accountRoutes = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Digital Banking System API" });
});

app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/auth', require('./routes/auth.route'));

//404 handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

module.exports = app;