import { App, normalizePath } from 'obsidian'

import { DBManager } from '../database-manager'
import { DuplicateTemplateException } from '../exception'
import { ConversationManager } from '../modules/conversation/conversation-manager'

import { ChatManager } from './chat/ChatManager'
import { INITIAL_MIGRATION_MARKER, ROOT_DIR } from './constants'
import { TemplateManager } from './command/TemplateManager'
import { serializeChatMessage } from './utils'

async function hasMigrationCompleted(app: App): Promise<boolean> {
	const markerPath = normalizePath(`${ROOT_DIR}/${INITIAL_MIGRATION_MARKER}`)
	return await app.vault.adapter.exists(markerPath)
}

async function markMigrationCompleted(app: App): Promise<void> {
	const markerPath = normalizePath(`${ROOT_DIR}/${INITIAL_MIGRATION_MARKER}`)
	await app.vault.adapter.write(
		markerPath,
		`Migration completed on ${new Date().toISOString()}`,
	)
}

async function transferChatHistory(app: App, dbManager: DBManager): Promise<void> {
	const oldChatManager = new ConversationManager(app, dbManager)
	const newChatManager = new ChatManager(app)

	const chatList = await oldChatManager.conversations()

	for (const chatMeta of chatList) {
		try {
			const existingChat = await newChatManager.findById(chatMeta.id)
			if (existingChat) {
				continue
			}

			const oldChatMessageList = await oldChatManager.findConversation(chatMeta.id)
			if (!oldChatMessageList) {
				continue
			}

			await newChatManager.createChat({
				id: chatMeta.id,
				title: chatMeta.title,
				messages: oldChatMessageList.map(msg => serializeChatMessage(msg)),
				createdAt: chatMeta.created_at instanceof Date ? chatMeta.created_at.getTime() : chatMeta.created_at,
				updatedAt: chatMeta.updated_at instanceof Date ? chatMeta.updated_at.getTime() : chatMeta.updated_at,
			})

			const verifyChat = await newChatManager.findById(chatMeta.id)
			if (!verifyChat) {
				throw new Error(`Failed to verify migration of chat ${chatMeta.id}`)
			}

			await oldChatManager.deleteConversation(chatMeta.id)
		} catch (error) {
			console.error(`Error migrating chat ${chatMeta.id}:`, error)
		}
	}

	console.log('Chat history migration to JSON database completed')
}

async function transferTemplates(
	app: App,
	dbManager: DBManager,
): Promise<void> {
	const jsonTemplateManager = new TemplateManager(app)
	const templateManager = dbManager.getCommandManager()

	const templates = await templateManager.findAllCommands()

	for (const template of templates) {
		try {
			if (await jsonTemplateManager.findByName(template.name)) {
				// Template already exists, skip
				continue
			}
			await jsonTemplateManager.createTemplate({
				name: template.name,
				content: template.content,
			})

			const verifyTemplate = await jsonTemplateManager.findByName(template.name)
			if (!verifyTemplate) {
				throw new Error(
					`Failed to verify migration of template ${template.name}`,
				)
			}

			await templateManager.deleteCommand(template.id)
		} catch (error) {
			if (error instanceof DuplicateTemplateException) {
				console.log(`Duplicate template found: ${template.name}. Skipping...`)
			} else {
				console.error(`Error migrating template ${template.name}:`, error)
			}
		}
	}

	console.log('Templates migration to JSON database completed')
}

export async function migrateToJsonDatabase(
	app: App,
	dbManager: DBManager,
	onMigrationComplete?: () => void,
): Promise<void> {
	if (await hasMigrationCompleted(app)) {
		return
	}

	await transferChatHistory(app, dbManager)
	await transferTemplates(app, dbManager)
	await markMigrationCompleted(app)
	onMigrationComplete?.()
}
