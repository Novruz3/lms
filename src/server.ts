const express = require("express");
const cors = require("cors");

import { Express } from "express";
import { PORT } from "./secrets";
import { errorMiddleware } from "./middlewares/errors";
import rootRouter from "./routes";

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/api", rootRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} port`);
});
