import { App } from 'obsidian'
import { v4 as uuidv4 } from 'uuid'

import { ChatConversationMeta } from '../../../types/chat'
import { AbstractJsonRepository } from '../base'
import { CHAT_DIR, ROOT_DIR } from '../constants'
import { EmptyChatTitleException } from '../exception'

import {
	CHAT_SCHEMA_VERSION,
	ChatConversation
} from './types'


export class ChatManager extends AbstractJsonRepository<
	ChatConversation,
	ChatConversationMeta
> {
	constructor(app: App) {
		super(app, `${ROOT_DIR}/${CHAT_DIR}`)
	}

	protected generateFileName(chat: ChatConversation): string {
		// 获取标题的前20个字符，如果标题为空则使用"New chat"
		const shortTitle = chat.title ? chat.title.substring(0, 20) : "New chat";
		
		// 替换文件名中不允许的字符为下划线
		const safeTitle = shortTitle.replace(/[\\/:*?"<>|]/g, "_");
		
		// 生成更简洁的文件名：v版本_简短标题_ID.json
		// 不再使用更新时间戳，减少文件名长度
		return `v${chat.schemaVersion}_${safeTitle}_${chat.id.substring(0, 8)}.json`;
	}

	protected parseFileName(fileName: string): ChatConversationMeta | null {
		// 更新正则表达式以匹配新的文件名格式
		// 新格式：v{schemaVersion}_{shortTitle}_{shortId}.json
		const regex = new RegExp(
			`^v${CHAT_SCHEMA_VERSION}_(.+)_([0-9a-f]{1,8})\\.json$`,
		)
		const match = fileName.match(regex)
		if (!match) return null

		const shortTitle = match[1]
		const shortId = match[2]
		
		// 使用文件的最后修改时间作为更新时间
		// 注意：我们不再需要从文件名中获取更新时间，而是从文件状态获取
		const updatedAt = Date.now(); // 默认使用当前时间，避免错误

		return {
			id: shortId,
			schemaVersion: CHAT_SCHEMA_VERSION,
			title: shortTitle,
			updatedAt,
			createdAt: 0,
		}
	}

	public async createChat(
		initialData: Partial<ChatConversation>,
	): Promise<ChatConversation> {
		if (initialData.title && initialData.title.length === 0) {
			throw new EmptyChatTitleException()
		}

		const now = Date.now()
		const newChat: ChatConversation = {
			id: uuidv4(),
			title: 'New chat',
			messages: [],
			createdAt: now,
			updatedAt: now,
			schemaVersion: CHAT_SCHEMA_VERSION,
			...initialData,
		}

		await this.create(newChat)
		return newChat
	}

	public async findById(id: string): Promise<ChatConversation | null> {
		const allMetadata = await this.listMetadata()
		// 修改查找逻辑，支持使用短ID进行匹配
		const targetMetadata = allMetadata.find((meta) => meta.id === id || meta.id.startsWith(id) || id.startsWith(meta.id))

		if (!targetMetadata) return null

		return this.read(targetMetadata.fileName)
	}

	public async updateChat(
		id: string,
		updates: Partial<
			Omit<ChatConversation, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>
		>,
	): Promise<ChatConversation | null> {
		const chat = await this.findById(id)
		if (!chat) return null

		if (updates.title !== undefined && updates.title.length === 0) {
			throw new EmptyChatTitleException()
		}

		const updatedChat: ChatConversation = {
			...chat,
			...updates,
			updatedAt: Date.now(),
		}

		await this.update(chat, updatedChat)
		return updatedChat
	}

	public async deleteChat(id: string): Promise<boolean> {
		const allMetadata = await this.listMetadata()
		// 修改删除逻辑，支持使用短ID进行匹配
		const targetMetadata = allMetadata.find((meta) => meta.id === id || meta.id.startsWith(id) || id.startsWith(meta.id))
		if (!targetMetadata) return false

		await this.delete(targetMetadata.fileName)
		return true
	}

	public async listChats(): Promise<ChatConversationMeta[]> {
		const metadata = await this.listMetadata()
		return metadata.sort((a, b) => b.updatedAt - a.updatedAt)
	}
}
