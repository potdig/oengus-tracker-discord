class LatestRun {
  eventId: string
  latestRunId: number

  constructor(eventId: string, latestRunId: number) {
    this.eventId = eventId
    this.latestRunId = latestRunId
  }
}

export { LatestRun }