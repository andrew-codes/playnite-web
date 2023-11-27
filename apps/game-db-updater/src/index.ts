import createDebugger from "debug";
import dotenv from "dotenv";
import path from "path";
import handlers from "./handlers";
import { createMqtt } from "./mqttClient";

async function run() {
  const debug = createDebugger("game-db-updater/index");
  debug("Starting game-db-updater");

  dotenv.config({ path: path.join(__dirname, "..", "local.env") });

  const { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } = process.env;
  const mqttPort = parseInt(MQTT_PORT || "1883", 10);
  const mqttClient = await createMqtt(
    MQTT_HOST,
    mqttPort,
    MQTT_USERNAME,
    MQTT_PASSWORD
  );
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
