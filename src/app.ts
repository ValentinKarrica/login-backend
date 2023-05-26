import express, { Express } from "express";
import userRouter from "./routes/userRoutes";
import morgan from "morgan";

const app: Express = express();

// 1) MIDDLEWARE
// auto run for development env
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
// access static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});

app.use((req: any, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use("/api/v1/users", userRouter);

export default app;
