import express from "express";
import cors from "cors";
import { buildServer } from "./server";
import { provideDependencies } from "./provideDependencies";

const app = express();
const PORT = process.env.PORT || 3001;
const deps = provideDependencies();

const server = buildServer(deps);
const serverInfo = server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
