import { describe, it, expect } from 'vitest'
import { formatPhoneNumber, formatTime } from '../src/app/utils/functions'

describe('Frontend Bug Tests - functions.ts', () => {
  describe('Bug 1: Phone Number Formatting', () => {
    it('should format 10-digit phone with all digits preserved', () => {
      // Bug is at line 49: normalizedInput.slice(7) should be slice(6)
      // This causes last digit to be cut off
      const result = formatPhoneNumber('1234567890')

      // Should be: +1 123-456-7890
      expect(result).toBe('+1 123-456-7890')

      // Check that all digits are present
      const digitsOnly = result.replace(/\D/g, '')
      expect(digitsOnly).toBe('11234567890') // +1 plus 10 digits
      expect(digitsOnly.length).toBe(11)
    })

    it('should handle phone with country code', () => {
      const result = formatPhoneNumber('11234567890')
      expect(result).toBe('+1 123-456-7890')
    })

    it('should format different phone numbers correctly', () => {
      expect(formatPhoneNumber('5551234567')).toBe('+1 555-123-4567')
      expect(formatPhoneNumber('9876543210')).toBe('+1 987-654-3210')
    })
  })

  describe('Bug 2: Time Validation', () => {
    it('should accept 59 minutes as valid', () => {
      // Bug is at line 84: minutes >= 59 should be minutes > 59
      // This incorrectly rejects minute value of 59
      const result = formatTime('12:59 PM')

      expect(result).not.toBe('def') // Should not return error
      expect(result).toBe('12:59 PM')
    })

    it('should reject 60 minutes as invalid', () => {
      const result = formatTime('12:60 PM')
      expect(result).toBe('def') // Should return error for invalid minute
    })

    it('should accept other valid minute values', () => {
      expect(formatTime('12:00 PM')).toBe('12:00 PM')
      expect(formatTime('12:30 PM')).toBe('12:30 PM')
      expect(formatTime('12:58 PM')).toBe('12:58 PM')
    })
  })
})
