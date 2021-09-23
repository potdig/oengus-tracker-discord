import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { Client, MessageEmbed, TextChannel } from 'discord.js'
import { Run } from './tracked-data-types'

class DiscordClient {
  private token: string
  private targetChannelId: string

  constructor(token: string, targetChannelId: string) {
    this.token = token
    this.targetChannelId = targetChannelId
  }

  async sendRuns(runs: Array<Run>) {
    const client = new Client()

    await client.login(this.token)
    const channel = await client.channels.fetch(this.targetChannelId)
    if (!channel?.isText) {
      throw new Error('Channel does not exists or not text channel')
    }
    const textChannel = channel as TextChannel

    const embeds = runs.map((run) => {
      return new MessageEmbed()
        .setColor('#CBEDD8')
        .setTitle(`${run.marathonName}に新しい応募があったよ`)
        .addFields(
          { name: 'タイトル', value: run.game },
          { name: '機種', value: run.console },
          { name: '走者／代表者', value: run.runner },
          { name: 'カテゴリ', value: run.category }
        )
    })

    await textChannel.send(embeds)

    client.destroy()
  }
}

class DiscordSecret {
  token: string
  targetChannelId: string
}

async function getDiscordSecret() {
  const secretsManager = new SecretsManagerClient({
    region: process.env['REGION']
  })
  const commandOutput = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: process.env['DISCORD_SECRET_NAME']
    })
  )
  return JSON.parse(commandOutput.SecretString ?? '{}') as DiscordSecret
}

export async function getDiscordClient() {
  const secret = await getDiscordSecret()
  if (!secret.token || !secret.targetChannelId) {
    throw new Error('Secret for Discord is not registered.')
  }
  return new DiscordClient(secret.token, secret.targetChannelId)
}
