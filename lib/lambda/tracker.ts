import { getDBClient } from './db-client'
import { getRuns } from './oengus-api'

export async function track() {
  const dbClient = await getDBClient()
  await dbClient.createTableIfNotExists()
  console.log(await getRuns('rtaijw2021'))
}

