import { getRuns } from './oengus-api'

export async function track() {
  console.log(await getRuns('rtaijw2021'))
}

