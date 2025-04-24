export class DatabaseException extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'DatabaseException'
	}
}

export class DatabaseNotInitializedException extends DatabaseException {
	constructor(message = 'Database not initialized') {
		super(message)
		this.name = 'DatabaseNotInitializedException'
	}
}

export class DuplicateCommandException extends DatabaseException {
	constructor(commandName: string) {
		super(`Command with name "${commandName}" already exists`)
		this.name = 'DuplicateCommandException'
	}
}
