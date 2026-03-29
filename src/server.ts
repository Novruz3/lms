const express = require("express");
const cors = require("cors");

import { Express } from "express";
import { PORT } from "./secrets";
import { errorMiddleware } from "./middlewares/errors";
import rootRouter from "./routes";
import { initSocket } from "./socket";
import morgan from "morgan";

const app: Express = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/api", rootRouter);
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT} port`);
});

initSocket(server);
