export default {
	chat: {
		stop: "Stop",
		errors: {
			failedToLoadConversation: "Failed to load conversation",
			failedToSaveHistory: "Failed to save chat history",
			failedToApplyChanges: "Failed to apply changes",
			conversationNotFound: "Conversation not found",
			fileNotFound: "File not found: {{path}}",
			failedToApplyEditChanges: "Failed to apply edit changes",
			failedToSearchAndReplace: "Failed to search and replace"
		},
		apply: {
			changesApplied: "Changes successfully applied",
			changesRejected: "User rejected changes"
		},
		search: {
			noResultsFound: "No results found for '{{query}}'"
		},
		history: {
			noConversations: "No conversations"
		},
		shortcutInfo: {
			editInline: "Edit inline",
			chatWithSelect: "Chat with selected text",
			submitWithVault: "Submit with vault"
		},
		searchResults: {
			showReferencedDocuments: "Show Referenced Documents"
		},
		LLMResponseInfoPopover: {
			header: "LLM response information",
			tokenCount: "Token count",
			promptTokens: "Prompt tokens",
			completionTokens: "Completion tokens",
			totalTokens: "Total tokens",
			model: "Model",
			estimatedPrice: "Estimated price",
			usageNotAvailable: "Usage statistics are not available for this model",
			notAvailable: "Not available"
		},
		queryProgress: {
			readingMentionableFiles: "Reading mentioned files",
			indexing: "Indexing",
			file: "file",
			chunkIndexed: "chunk indexed",
			queryingVault: "Querying the vault",
			readingRelatedFiles: "Reading related files"
		},
		reactMarkdown: {
			allow: "Allow",
			allowing: "Allowing...",
			success: "Success",
			failed: "Failed",
			switchToMode: 'Switch to "{mode}" mode',
			semanticSearchInPath: 'semantic search files "{query}" in {path}',
			webSearch: "Web search: {query}",
			searching: "Searching...",
			done: "Done",
			searchAndReplaceInPath: "Search and replace in {path}",
			applying: "Applying...",
			apply: "Apply",
			reasoning: "Reasoning",
			readFile: "Read file: {path}",
			listFiles: "List files: {path}",
			fetchUrlsContent: "Fetch URLs Content",
			fetching: "Fetching...",
			copied: "Copied",
			copy: "Copy",
			editOrApplyDiff: "{mode}: {path}",
			loading: "Loading...",
			regexSearchInPath: 'regex search files "{regex}" in {path}',
			createNewNote: "Create new note",
			copyMsg: "Copy message",
			taskCompletion: "Task Completion",
			askFollowupQuestion: "Ask Followup Question:",
			viewDetails: "View details"
		},
		input: {
			submit: "Submit",
			collectedModels: "Collected Models",
			loading: "Loading...",
			image: "Image",
			createCommand: "Create Command"
		}
	},
	inlineEdit: {
		placeholder: "Input instruction, Enter to submit, Esc to close",
		fetchModelsError: "Failed to fetch provider models:",
		submitting: "submitting...",
		submit: "submit",
		ragNotNeeded: "RAG not needed for inline edit",
		noActiveFile: "No active file",
		noActiveEditor: "No active editor",
		noTextSelected: "No text selected",
		noActiveContext: "No active file, editor, or selection",
		invalidChatModel: "Invalid chat model",
		emptyLLMResponse: "Empty response from LLM",
		invalidActiveFile: "Invalid active file",
		readFileError: "Failed to read file:",
		applyChangesError: "Failed to apply changes",
		inlineEditError: "Error in inline edit:",
	},
	prompt: {
		"title": "Prompts",
		"description": "Click + to create a new mode",
		"modeName": "Mode Name",
		"modeNameDescription": "Mode Description",
		"modeNamePlaceholder": "Enter mode name...",
		"builtinModeNameWarning": "Built-in mode names cannot be modified",
		"modeNameRequirements": "Mode names must only contain letters, numbers, and hyphens",
		"roleDefinition": "Role Definition",
		"roleDefinitionDescription": "Set professional domain and response style",
		"roleDefinitionPlaceholder": "Enter role definition...",
		"availableFeatures": "Available Features",
		"builtinFeaturesWarning": "Available features of built-in modes cannot be modified",
		"readFiles": "Read Files",
		"editFiles": "Edit Files",
		"webSearch": "Web Search",
		"modeSpecificRules": "Mode-Specific Rules (Optional)",
		"modeSpecificRulesDescription": "Mode-specific rules",
		"modeSpecificRulesPlaceholder": "Enter mode custom instructions...",
		"supportReadingConfig": "Support reading configuration from",
		"file": "file",
		"overrideSystemPrompt": "Override System Prompt",
		"overrideDescription": "You can completely replace the system prompt for this mode (excluding role definition and custom instructions) by creating a file",
		"overrideWarning": ". This is a very advanced feature that will override all built-in prompts including tool usage, please use with caution",
		"previewSystemPrompt": "Preview System Prompt",
		"save": "Save"
	},
	command: {
		"createQuickCommand": "Create Quick Command",
		"name": "Name",
		"content": "Content",
		"createCommand": "Create Command",
		"searchPlaceholder": "Search Command...",
		"noCommandsFound": "No commands found",
		"updateCommand": "Update Command",
		"errorContentRequired": "Please enter a content for your template",
		"errorNameRequired": "Please enter a name for your template"
	}
}
