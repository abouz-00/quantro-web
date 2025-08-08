import { 
  generateEntryId, 
  sameDay
} from '../dateUtils'

describe('dateUtils', () => {
  describe('generateEntryId', () => {
    it('generates unique IDs', () => {
      const id1 = generateEntryId()
      const id2 = generateEntryId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
    })

    it('generates IDs with correct format', () => {
      const id = generateEntryId()
      
      // Should be a string with timestamp and random component
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(10)
    })
  })

  describe('sameDay', () => {
    it('returns true for same dates', () => {
      const date1 = new Date('2023-01-15T10:30:00Z')
      const date2 = new Date('2023-01-15T18:45:00Z')
      
      expect(sameDay(date1, date2)).toBe(true)
    })

    it('returns false for different dates', () => {
      const date1 = new Date('2023-01-15T10:30:00Z')
      const date2 = new Date('2023-01-16T10:30:00Z')
      
      expect(sameDay(date1, date2)).toBe(false)
    })

    it('handles year differences', () => {
      const date1 = new Date('2023-01-15T10:30:00Z')
      const date2 = new Date('2024-01-15T10:30:00Z')
      
      expect(sameDay(date1, date2)).toBe(false)
    })

    it('handles month differences', () => {
      const date1 = new Date('2023-01-15T10:30:00Z')
      const date2 = new Date('2023-02-15T10:30:00Z')
      
      expect(sameDay(date1, date2)).toBe(false)
    })

    it('handles day differences', () => {
      const date1 = new Date('2023-01-15T10:30:00Z')
      const date2 = new Date('2023-01-16T10:30:00Z')
      
      expect(sameDay(date1, date2)).toBe(false)
    })
  })
})
