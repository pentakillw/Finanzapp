import { describe, it, expect } from 'vitest'
import { signUpSchema } from '../schemas/auth'

describe('Auth Validation', () => {
  it('validates correct email', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      user_name: 'Usuario',
      currency: 'MXN'
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
      user_name: 'Usuario',
      currency: 'MXN'
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: '123',
      user_name: 'Usuario',
      currency: 'MXN'
    })
    expect(result.success).toBe(false)
  })
})
