import { afterEach, expect, jest, test } from '@jest/globals'
import { type AsyncMqttClient } from 'async-mqtt'
import app from '..'

const mockHandler = jest.fn()
jest.mock('../handlers', () => {
  const realHandlers = jest.requireActual<{
    default: Array<(topic: string, message: Buffer) => void>
  }>('../handlers').default
  return realHandlers.concat([mockHandler])
})

let testMqttClient: AsyncMqttClient
afterEach(() => {
  testMqttClient?.end()
})

test('Connects to MQTT and subscribes to playnite/# topics.', (done) => {
  mockHandler.mockImplementationOnce(() => {
    expect(mockHandler).toHaveBeenCalledWith(
      'playnite/test',
      Buffer.from('test'),
    )
    done()
  })

  app().then((mqttClient) => {
    testMqttClient = mqttClient
    testMqttClient.publish('playnite/test', 'test')
  })
})
