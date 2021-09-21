class Run {
  marathonName: string
  runner: string
  game: string
  console: string
  category: string
  est: string

  constructor(marathonName: string, runner: string, game: string, console: string, category: string, est: string) {
    this.marathonName = marathonName
    this.runner = runner
    this.game = game
    this.console = console
    this.category = category
    this.est = est
  }
}

export {
  Run
}