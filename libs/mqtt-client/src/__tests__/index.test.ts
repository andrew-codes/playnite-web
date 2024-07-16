import { test } from '@jest/globals'
import { AsyncMqttClient, connectAsync } from 'async-mqtt'
import { when } from 'jest-when'
import { createConnectedMqttClient } from '..'

jest.mock('async-mqtt')

describe('mqtt-client', () => {
  beforeEach(() => {})

  test(`Create a connected client.`, async () => {
    const expected = jest.mocked(AsyncMqttClient)
    when(connectAsync)
      .calledWith('tcp://localhost', {
        password: 'dev',
        port: 1883,
        username: 'local',
      })
      .mockResolvedValue(expected)

    const actual = await createConnectedMqttClient({
      host: 'localhost',
      port: 1883,
      username: 'local',
      password: 'dev',
    })

    expect(actual).toEqual(expected)
  })

  test(`Defaults to env vars.
- Environment variables are uses in place of missing connection option values.`, async () => {
    process.env.MQTT_HOST = 'local'
    process.env.MQTT_PORT = '1993'
    process.env.MQTT_USERNAME = 'admin'
    process.env.MQTT_PASSWORD = 'password'

    const expected = jest.mocked(AsyncMqttClient)
    when(connectAsync)
      .calledWith('tcp://local', {
        password: 'password',
        port: 1993,
        username: 'admin',
      })
      .mockResolvedValue(expected)

    const actualWithNoConnectionOptions = await createConnectedMqttClient()
    expect(actualWithNoConnectionOptions).toEqual(expected)

    const actualWithEmptyConnectionOptions = await createConnectedMqttClient({})
    expect(actualWithEmptyConnectionOptions).toEqual(expected)

    expect(connectAsync).toHaveBeenCalledTimes(2)
  })

  test(`Defaults when no options or env vars.
- Defaults to localhost and port 1883.`, async () => {
    const expected = jest.mocked(AsyncMqttClient)
    when(connectAsync)
      .calledWith('tcp://localhost', {
        password: '',
        port: 1883,
        username: '',
      })
      .mockResolvedValue(expected)

    const actualWithNoConnectionOptions = await createConnectedMqttClient()
    expect(actualWithNoConnectionOptions).toEqual(expected)

    const actualWithEmptyConnectionOptions = await createConnectedMqttClient({})
    expect(actualWithEmptyConnectionOptions).toEqual(expected)

    expect(connectAsync).toHaveBeenCalledTimes(2)
  })
})
