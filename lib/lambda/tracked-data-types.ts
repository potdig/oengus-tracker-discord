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
}

export { Run }
