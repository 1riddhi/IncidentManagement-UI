import { describe, expect, it } from 'vitest'
import { incidents } from '../data/incidents'
import { filterIncidents } from './incident'

describe('incident filtering', () => {
  it('searches by service and RCA content', () => {
    expect(filterIncidents(incidents, 'redis', 30).every((incident) => [incident.title, incident.service, incident.rootCause].join(' ').toLowerCase().includes('redis'))).toBe(true)
    expect(filterIncidents(incidents, 'deadlock', 30).length).toBeGreaterThan(0)
  })

  it('limits the operational queue to the selected date range', () => {
    expect(filterIncidents(incidents, '', 5).length).toBeLessThan(filterIncidents(incidents, '', 30).length)
  })
})
