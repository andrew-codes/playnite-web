import { describe, expect, test } from '@jest/globals'
import { reducer, signedIn, signedOut } from '../authSlice'

describe('authSlice', () => {
  test('signedIn action', () => {
    const actual = reducer({ isAuthenticated: false }, signedIn())

    expect(actual.isAuthenticated).toBe(true)
  })

  test('signedOut action', () => {
    const actual = reducer({ isAuthenticated: true }, signedOut())

    expect(actual.isAuthenticated).toBe(false)
  })
})
