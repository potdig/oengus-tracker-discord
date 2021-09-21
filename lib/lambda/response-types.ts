class Marathon {
  id: string
  name: string
}

class Submission {
  id: number
  user: User
  games: Array<Game>
}

class User {
  id: number
  username: string
  usernameJapanese: string
}

class Game {
  id: number
  name: string
  console: string
  categories: Array<Category>
}

class Category {
  id: number
  name: string
  estimate: string
  type: string
}

export {
  Marathon,
  Submission,
  User,
  Game,
  Category
}