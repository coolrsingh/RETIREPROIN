import cors from "cors";
import express, { type Express } from "express";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app: Express = express();

const ALLOWED_ORIGIN_PATTERNS = [
  /\.replit\.dev$/,
  /\.janeway\.replit\.dev$/,
  /\.expo\.janeway\.replit\.dev$/,
  /^http:\/\/localhost(:\d+)?$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
      callback(null, allowed ? origin : false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

export default app;
