import { getDBClient } from './db-client'
import { LatestRun } from './db-table-types'
import { getDiscordClient } from './discord-client'
import { getRuns } from './oengus-api'

export async function track() {
  // // テーブル作成
  // const dbClient = await getDBClient()
  // await dbClient.createTableIfNotExists()

  // const eventId = 'rtaijw2021'
  // // 前回取得時の最新 ID を取得
  // const previousLatestRun = await dbClient.getLatestRunIdOf(eventId)
  // console.log(`previous latest run ID: ${previousLatestRun?.latestRunId}`)

  // // 前回の最新 ID より後のカテゴリを取りに行く
  // const runs = await getRuns(eventId, previousLatestRun?.latestRunId ?? 0)

  // if (runs.length > 0) {
  //   // 今回の最新 ID を取得
  //   const latestRunId = runs.reduce(
  //     (acc, run) => (run.id > acc ? run.id : acc),
  //     0
  //   )

  //   // 今回の最新 ID を DB に登録
  //   await dbClient.saveLatestRun(new LatestRun(eventId, latestRunId))

  //   // Discord に送信
    const discordClient = await getDiscordClient()
    await discordClient.sendRuns([])
  // } else {
  //   console.log('There are no new runs.')
  // }
}
