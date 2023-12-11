const mockHandler = jest.fn()
jest.mock('../handlers', () => {
    const realHandlers = jest.requireActual('../handlers').default
    return realHandlers.concat([mockHandler])
})
import { type AsyncMqttClient } from 'async-mqtt'
import app from '..'

let testMqttClient: AsyncMqttClient
afterEach(() => {
    testMqttClient?.end()
})

test('Connects to MQTT and subscribes to playnite/# topics.', (done) => {
    mockHandler.mockImplementationOnce(() => {
        expect(mockHandler).toHaveBeenCalledWith('playnite/test', 'test')
        done()
    })

    app().then((mqttClient) => {
        testMqttClient = mqttClient
        testMqttClient.publish('playnite/test', 'test')
    })
})
