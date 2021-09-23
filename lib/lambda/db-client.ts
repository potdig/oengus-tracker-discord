import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { Client } from 'pg'
import { LatestRun } from './db-table-types'

class DBClient {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async createTableIfNotExists() {
    await this.client.query(`
    CREATE TABLE IF NOT EXISTS latest_run_ids (
      event_id varchar UNIQUE,
      latest_run_id int
    );
    `)
  }

  async getLatestRunIdOf(eventId: string) {
    const result = await this.client.query({
      name: 'get-latest-run-id',
      text: `
        SELECT
          event_id,
          latest_run_id
        FROM
          latest_run_ids
        WHERE
          event_id = $1
        ;
        `,
      values: [eventId]
    })
    console.log(`Rows: ${result.rows}`)
    if (result.rowCount === 0) {
      return new LatestRun(eventId, 0)
    } else {
      const row = result.rows[0]
      return new LatestRun(
        row['event_id'] as string,
        row['latest_run_id'] as number
      )
    }
  }
}

class RDSSecret {
  port: number
  username: string
  password: string
}

async function getRDSSecret() {
  const secretsManager = new SecretsManagerClient({
    region: process.env['REGION']
  })
  const commandOutput = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: process.env['RDS_SECRET_NAME']
    })
  )
  return JSON.parse(commandOutput.SecretString ?? '{}') as RDSSecret
}

export async function getDBClient() {
  const rdsSecret = await getRDSSecret()
  const proxyEndpoint = process.env['PROXY_ENDPOINT']
  const pgClient = new Client({
    host: proxyEndpoint,
    port: rdsSecret.port,
    user: rdsSecret.username,
    password: rdsSecret.password,
    database: 'oengus-tracker',
    connectionTimeoutMillis: 10000,
    query_timeout: 10000
  })
  await pgClient.connect()
  console.log(`
  host: ${proxyEndpoint}
  port: ${rdsSecret.port}
  `)
  return new DBClient(pgClient)
}
