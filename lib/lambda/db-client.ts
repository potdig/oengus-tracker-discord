import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { Client } from 'pg'
import { LatestRun } from './db-table-types'

class DBClient {
  private client: Client
  private readonly tableName = 'latest_run_ids'

  constructor(client: Client) {
    this.client = client
  }

  async createTableIfNotExists() {
    await this.client.query(`
    CREATE TABLE IF NOT EXISTS ${this.tableName} (
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
          ${this.tableName}
        WHERE
          event_id = $1
        ;
        `,
      values: [eventId]
    })
    console.log(`Rows: ${result.rows}`)
    if (result.rowCount === 0) {
      return null
    } else {
      const row = result.rows[0]
      return new LatestRun(
        row['event_id'] as string,
        row['latest_run_id'] as number
      )
    }
  }

  async saveLatestRun(run: LatestRun) {
    const current = await this.getLatestRunIdOf(run.eventId)
    if (current) {
      await this.updateLatestRun(run)
    } else {
      await this.insertLatestRun(run)
    }
  }

  private async insertLatestRun(run: LatestRun) {
    await this.client.query({
      name: 'insert-latest-run',
      text: `
        INSERT INTO
          ${this.tableName}
        VALUES (
          $1,
          $2
        );
        `,
      values: [ run.eventId, run.latestRunId ]
    })
  }

  private async updateLatestRun(run: LatestRun) {
    await this.client.query({
      name: 'update-latest-run',
      text: `
        UPDATE 
          ${this.tableName}
        SET
          latest_run_id = $1
        WHERE
          event_id = $2
        ;
        `,
      values: [ run.latestRunId, run.eventId ] 
    })
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
