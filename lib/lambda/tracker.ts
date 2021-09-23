import { getDBClient } from './db-client'
import { getRuns } from './oengus-api'

export async function track() {
  const dbClient = await getDBClient()
  await dbClient.createTableIfNotExists()

  const eventId = 'rtaijw2021'
  const latestRun = await dbClient.getLatestRunIdOf(eventId)
  console.log(`latestRun: ${latestRun}`)
  console.log(await getRuns(eventId, latestRun.latestRunId))
}

