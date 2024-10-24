import { describe, expect, test } from '@jest/globals'
import { reducer, setDeviceType } from '../layoutSlice'

describe('layoutSlice', () => {
  test('Device type detected.', () => {
    const actual = reducer({ deviceType: null }, setDeviceType('desktop'))

    expect(actual.deviceType).toEqual('desktop')
  })
})
