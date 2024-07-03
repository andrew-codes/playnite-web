import { describe, expect, test } from '@jest/globals'
import { reducer, setDeviceType } from '../layoutSlice'

describe('layoutSlice', () => {
  test('signedIn action', () => {
    const actual = reducer(
      { scrollPosition: 0, deviceType: null },
      setDeviceType('desktop'),
    )

    expect(actual.deviceType).toEqual('desktop')
  })
})
