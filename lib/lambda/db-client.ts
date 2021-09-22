import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { Client } from 'pg'

class DBClient {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async createTableIfNotExists() {
    console.log(await this.client.query('SELECT NOW()'))
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
