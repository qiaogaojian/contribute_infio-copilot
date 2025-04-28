export class DuplicateCommandException extends Error {
  constructor(commandName: string) {
    super(`Command with name "${commandName}" already exists`)
    this.name = 'DuplicateCommandException'
  }
}

export class DuplicateCustomModeException extends Error {
  constructor(customModeName: string) {
    super(`Custom mode with name "${customModeName}" already exists`)
    this.name = 'DuplicateCustomModeException'
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

export class EmptyCustomModeNameException extends Error {
  constructor() {
    super('Custom mode name cannot be empty')
    this.name = 'EmptyCustomModeNameException'
  }
}