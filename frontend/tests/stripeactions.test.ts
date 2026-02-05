import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Frontend Bug Tests - stripeactions.ts', () => {
  describe('Bug 3: Stripe Amount Calculation', () => {
    it('should not multiply by 100 twice in payment amount', () => {
      // Bug: Math.round(Number(res.data.course_Price) * 100) * 100
      // Should be: Math.round(Number(res.data.course_Price) * 100)

      const filePath = resolve(__dirname, '../src/app/utils/stripeactions.ts')
      const content = readFileSync(filePath, 'utf-8')

      // Check for the double multiplication bug
      const doubleMultiply = /Math\.round\([^)]*\* *100\) *\* *100/
      expect(content).not.toMatch(doubleMultiply)
    })

    it('should have correct Stripe amount calculation pattern', () => {
      const filePath = resolve(__dirname, '../src/app/utils/stripeactions.ts')
      const content = readFileSync(filePath, 'utf-8')

      // Should have single multiplication by 100 (Stripe expects cents)
      const correctPattern = /Math\.round\([^)]*\* *100\)/
      expect(content).toMatch(correctPattern)
    })
  })

  describe('Bug 9: Instructor Check Logic', () => {
    it('should check instructor array length not object property', () => {
      // Bug: instructor.length === 0 but instructor is res.data[0] (object)
      // Should check: res.data.length === 0

      const filePath = resolve(__dirname, '../src/app/utils/stripeactions.ts')
      const content = readFileSync(filePath, 'utf-8')

      // Look for the pattern around instructor checks
      // Should use res.data.length or similar, not instructor.length on an object
      const lines = content.split('\n')

      let foundBug = false
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // Check if we assign instructor from res.data[0]
        if (line.includes('instructor') && line.includes('res.data[0]')) {
          // Look ahead for length check on instructor
          for (let j = i; j < Math.min(i + 10, lines.length); j++) {
            if (lines[j].includes('instructor.length')) {
              foundBug = true
              break
            }
          }
        }
      }

      expect(foundBug).toBe(false)
    })
  })
})
