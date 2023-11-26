import { AsyncMqttClient, connectAsync } from "async-mqtt";
import createDebugger from "debug";

const { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } = process.env;
const mqttPort = parseInt(MQTT_PORT || "1883", 10);

let mqttClient: AsyncMqttClient;

const createMqtt = async (
  host: string | undefined = MQTT_HOST,
  port: number | undefined = mqttPort,
  username: string | undefined = MQTT_USERNAME,
  password: string | undefined = MQTT_PASSWORD
): Promise<AsyncMqttClient> => {
  const debug = createDebugger("game-db-updater/mqttClient");

  if (!mqttClient) {
    debug(
      `Existing MQTT client not found; creating one with the following options: host=${host}, port=${port}, username=${username}`
    );
    mqttClient = await connectAsync(`tcp://${host}`, {
      password,
      port,
      username,
    });
  }

  debug("Returning MQTT client");
  return mqttClient;
};

export { createMqtt };
