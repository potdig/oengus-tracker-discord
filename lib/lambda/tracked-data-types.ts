class Run {
  id: number
  marathonName: string
  runner: string
  game: string
  console: string
  category: string
  est: string

  constructor(
    id: number,
    marathonName: string,
    runner: string,
    game: string,
    console: string,
    category: string,
    est: string
  ) {
    this.id = id
    this.marathonName = marathonName
    this.runner = runner
    this.game = game
    this.console = console
    this.category = category
    this.est = est
  }

  get formattedEst() {
    const fields = this.est.match(/PT([0-9]+H)?([0-9]+M)?([0-9]+S)?/)?.slice(1)
    if (!fields) {
      return 'Unknown'
    }

    const hour = fields.find(s => this.endsWith('H', s))?.replace('H', '')
    const minutes = fields.find(s => this.endsWith('M', s))?.replace('M', '')
    const seconds = fields.find(s => this.endsWith('S', s))?.replace('S', '')
    return `${hour ?? '0'}:${minutes ?? '00'}:${seconds ?? '00'}`
  }

  private endsWith = (str: string, target: string) =>
    RegExp(`.+${str}`).test(target)
}

export { Run }
