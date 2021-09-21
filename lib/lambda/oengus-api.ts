import fetch from 'node-fetch'
import { Marathon, Submission } from './response-types'
import { Run } from './tracked-data-types'

const marathonUrlFor = (eventId: string) =>
  `https://oengus.io/api/marathons/${eventId}`
const submissionUrlFor = (eventId: string) =>
  `${marathonUrlFor(eventId)}/submissions`

async function getRuns(eventId: string, newerThan: number = 0) {
  console.log(`Fetch marathon info from ${marathonUrlFor(eventId)}`)
  const marathonResponse = await fetch(marathonUrlFor(eventId))
  console.log(`Status: ${marathonResponse.status}`)
  const marathon = marathonResponse.ok
    ? ((await marathonResponse.json()) as Marathon)
    : null
  const marathonName = marathon?.name ?? 'Unknown Marathon'

  console.log(`Fetch marathon info from ${submissionUrlFor(eventId)}`)
  const submissionsResponse = await fetch(submissionUrlFor(eventId))
  console.log(`Status: ${submissionsResponse.status}`)
  if (submissionsResponse.ok) {
    const submissions = (await submissionsResponse.json()) as Array<Submission>
    // Array<Array<Run>> for each submission (flatten) => Array<Run>
    return submissions.flatMap((submission) => {
      // Array<Array<Run>> for each game (flatten) => Array<Run>
      return submission.games.flatMap((game) => {
        // Array<Run> for each category
        return game.categories.map((category) => {
          const user = submission.user
          return new Run(
            marathonName,
            user.usernameJapanese ? user.usernameJapanese : user.username,
            game.name,
            game.console,
            category.name,
            category.estimate
          )
        })
      })
    })
  } else {
    return []
  }
}

export { getRuns }
