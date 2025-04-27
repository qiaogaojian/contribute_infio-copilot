
import * as path from 'path'

import { App, normalizePath } from 'obsidian'

import {
	CustomModePrompts,
	Mode,
	ModeConfig,
	PromptComponent,
	defaultModeSlug,
	getGroupName,
	getModeBySlug,
	modes
} from "../../utils/modes"
import { DiffStrategy } from "../diff/DiffStrategy"
import { McpHub } from "../mcp/McpHub"


import { ROOT_DIR } from './constants'
import {
	addCustomInstructions,
	getCapabilitiesSection,
	getMcpServersSection,
	getModesSection,
	getObjectiveSection,
	getRulesSection,
	getSharedToolUseSection,
	getSystemInfoSection,
	getToolUseGuidelinesSection,
} from "./sections"
// import { loadSystemPromptFile } from "./sections/custom-system-prompt"
import { getToolDescriptionsForMode } from "./tools"


export class SystemPromptsManager {
	protected dataDir: string
	protected app: App

	constructor(app: App) {
		this.app = app
		this.dataDir = normalizePath(`${ROOT_DIR}`)
		this.ensureDirectory()
	}

	private async ensureDirectory(): Promise<void> {
		console.log("this.app, ", this.app)
		if (!(await this.app.vault.adapter.exists(this.dataDir))) {
			await this.app.vault.adapter.mkdir(this.dataDir)
		}
	}

	private getSystemPromptFilePath(mode: Mode): string {
		// Format: {mode slug}_system_prompt.md
		return `${mode}/system_prompt.md`
	}

	private async loadSystemPromptFile(mode: Mode): Promise<string> {
		const fileName = this.getSystemPromptFilePath(mode)
		const filePath = normalizePath(path.join(this.dataDir, fileName))
		if (!(await this.app.vault.adapter.exists(filePath))) {
			return ""
		}
		const content = await this.app.vault.adapter.read(filePath)
		return content
	}

	private async generatePrompt(
		cwd: string,
		supportsComputerUse: boolean,
		mode: Mode,
		filesSearchMethod: string,
		mcpHub?: McpHub,
		diffStrategy?: DiffStrategy,
		browserViewportSize?: string,
		promptComponent?: PromptComponent,
		customModeConfigs?: ModeConfig[],
		globalCustomInstructions?: string,
		preferredLanguage?: string,
		diffEnabled?: boolean,
		experiments?: Record<string, boolean>,
		enableMcpServerCreation?: boolean,
	): Promise<string> {
		// if (!context) {
		// 	throw new Error("Extension context is required for generating system prompt")
		// }

		// // If diff is disabled, don't pass the diffStrategy
		// const effectiveDiffStrategy = diffEnabled ? diffStrategy : undefined

		// Get the full mode config to ensure we have the role definition
		const modeConfig = getModeBySlug(mode, customModeConfigs) || modes.find((m) => m.slug === mode) || modes[0]
		const roleDefinition = promptComponent?.roleDefinition || modeConfig.roleDefinition

		const [modesSection, mcpServersSection] = await Promise.all([
			getModesSection(),
			modeConfig.groups.some((groupEntry) => getGroupName(groupEntry) === "mcp")
				? getMcpServersSection(mcpHub, diffStrategy, enableMcpServerCreation)
				: Promise.resolve(""),
		])

		const basePrompt = `${roleDefinition}

${getSharedToolUseSection()}

${getToolDescriptionsForMode(
			mode,
			cwd,
			filesSearchMethod,
			supportsComputerUse,
			diffStrategy,
			browserViewportSize,
			mcpHub,
			customModeConfigs,
			experiments,
		)}

${getToolUseGuidelinesSection()}

${mcpServersSection}

${getCapabilitiesSection(
			mode,
			cwd,
			filesSearchMethod,
		)}

${modesSection}

${getRulesSection(
			mode,
			cwd,
			filesSearchMethod,
			supportsComputerUse,
			diffStrategy,
			experiments,
		)}

${getSystemInfoSection(cwd)}

${getObjectiveSection(mode)}

${await addCustomInstructions(this.app, promptComponent?.customInstructions || modeConfig.customInstructions || "", globalCustomInstructions || "", cwd, mode, { preferredLanguage })}`

		return basePrompt
	}

	public async getSystemPrompt(
		cwd: string,
		supportsComputerUse: boolean,
		mode: Mode = defaultModeSlug,
		filesSearchMethod: string = 'regex',
		preferredLanguage?: string,
		diffStrategy?: DiffStrategy,
		mcpHub?: McpHub,
		browserViewportSize?: string,
		customModePrompts?: CustomModePrompts,
		customModes?: ModeConfig[],
		globalCustomInstructions?: string,
		diffEnabled?: boolean,
		experiments?: Record<string, boolean>,
		enableMcpServerCreation?: boolean,
	): Promise<string> {

		const getPromptComponent = (value: unknown): PromptComponent | undefined => {
			if (typeof value === "object" && value !== null) {
				return value as PromptComponent
			}
			return undefined
		}

		// Try to load custom system prompt from file
		const fileCustomSystemPrompt = await this.loadSystemPromptFile(mode)

		// Check if it's a custom mode
		const promptComponent = getPromptComponent(customModePrompts?.[mode])

		// Get full mode config from custom modes or fall back to built-in modes
		const currentMode = getModeBySlug(mode, customModes) || modes.find((m) => m.slug === mode) || modes[0]

		// If a file-based custom system prompt exists, use it
		if (fileCustomSystemPrompt) {
			const roleDefinition = promptComponent?.roleDefinition || currentMode.roleDefinition
			const customInstructions = await addCustomInstructions(
				this.app,
				promptComponent?.customInstructions || currentMode.customInstructions || "",
				globalCustomInstructions || "",
				cwd,
				mode,
				{ preferredLanguage },
			)
			return `${roleDefinition}

${fileCustomSystemPrompt}

${customInstructions}`
		}

		// // If diff is disabled, don't pass the diffStrategy
		// const effectiveDiffStrategy = diffEnabled ? diffStrategy : undefined

		return this.generatePrompt(
			// context,
			cwd,
			supportsComputerUse,
			currentMode.slug,
			filesSearchMethod,
			mcpHub,
			diffStrategy,
			browserViewportSize,
			promptComponent,
			customModes,
			globalCustomInstructions,
			preferredLanguage,
			diffEnabled,
			experiments,
			enableMcpServerCreation,
		)
	}
}
