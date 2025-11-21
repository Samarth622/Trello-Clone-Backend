import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import boardRoutes from "./routes/board.route.js";
import listRoutes from "./routes/list.route.js";
import cardRoutes from "./routes/card.route.js";
import recsRoutes from "./routes/recs.route.js";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Trello Clone Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/list", listRoutes);
app.use("/api/card", cardRoutes);
app.use("/api/recommendations", recsRoutes);

export default app;
