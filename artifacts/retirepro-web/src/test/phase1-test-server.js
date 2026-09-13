import app from "../../../api-server/src/app";
import { registerRoutes } from "../../../api-server/src/routes/routes";

export async function startPhaseOneTestServer() {
  const server = await registerRoutes(app);
  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}