test("sample test that always passes", () => {
  expect(true).toEqual(true);
  expect(process.env.MQTT_HOST).toEqual("localhost");
});
