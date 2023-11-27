const mockHandler = jest.fn();
jest.mock("../handlers", () => {
  const realHandlers = jest.requireActual("../handlers").default;
  return realHandlers.concat([mockHandler]);
});
import { type AsyncMqttClient, connectAsync } from "async-mqtt";
import sut from "..";
import { createMqtt } from "../mqttClient";

let testMqttClient: AsyncMqttClient;
afterEach(() => {
  testMqttClient?.end();
});

test("Connects to MQTT and subscribes to playnite/# topics.", (done) => {
  mockHandler.mockImplementationOnce(() => {
    expect(mockHandler).toHaveBeenCalledWith("playnite/test", "test");
    done();
  });

  sut().then((mqttClient) => {
    testMqttClient = mqttClient;
    testMqttClient.publish("playnite/test", "test");
  });
});
