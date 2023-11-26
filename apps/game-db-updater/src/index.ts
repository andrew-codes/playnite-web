import createDebugger from "debug";
import handlers from "./handlers";
import { createMqtt } from "./mqttClient";

async function run() {
  const debug = createDebugger("game-db-updater/index");
  debug("Starting game-db-updater");

  const mqttClient = await createMqtt();
  mqttClient.subscribe("playnite/#");

  mqttClient.on("message", async (topic, payload) => {
    try {
      const payloadString = payload.toString();
      await Promise.all(
        handlers.map((handler) => handler(topic, payloadString))
      );
    } catch (error) {
      console.error(error);
    }
  });
}

if (require.main === module) {
  run();
}
