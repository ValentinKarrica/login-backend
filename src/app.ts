import express, { Express } from "express";
import userRouter from "./routes/userRoutes";
import morgan from "morgan";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorControler";
var cors = require("cors");

const app: Express = express();
app.use(cors());

// MIDDLEWARE
// auto run for development env
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
// access static files
app.use(express.static(`${__dirname}/public`));

app.use((req: any, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//  ROUTES
app.use("/api/v1/users", userRouter);

// Catch all other Error
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Error Handler
app.use(globalErrorHandler);

export default app;
