export class DuplicateCommandException extends Error {
  constructor(commandName: string) {
    super(`Command with name "${commandName}" already exists`)
    this.name = 'DuplicateCommandException'
  }
}

export class EmptyCommandNameException extends Error {
  constructor() {
    super('Command name cannot be empty')
    this.name = 'EmptyCommandNameException'
  }
}

export class EmptyChatTitleException extends Error {
  constructor() {
    super('Chat title cannot be empty')
    this.name = 'EmptyChatTitleException'
  }
}
