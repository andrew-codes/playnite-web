import { AsyncMqttClient, connectAsync } from "async-mqtt";
import createDebugger from "debug";

let mqttClient: AsyncMqttClient;

const createMqtt = async (
  host: string = "localhost",
  port: number = 1883,
  username: string = "",
  password: string = ""
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
