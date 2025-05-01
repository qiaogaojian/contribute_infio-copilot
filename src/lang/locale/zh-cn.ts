// import { APPNAME, MINEXCALIDRAWVERSION } from "src/constants/constants";

// 简体中文
export default {
	chat: {
		stop: "停止",
		errors: {
			failedToLoadConversation: "加载对话失败",
			failedToSaveHistory: "保存聊天记录失败",
			failedToApplyChanges: "应用更改失败",
			conversationNotFound: "未找到对话",
			fileNotFound: "未找到文件：{{path}}",
			failedToApplyEditChanges: "应用编辑更改失败",
			failedToSearchAndReplace: "搜索和替换失败"
		},
		apply: {
			changesApplied: "更改已成功应用",
			changesRejected: "用户拒绝了更改"
		},
		search: {
			noResultsFound: "未找到 '{{query}}' 的结果"
		},
		history: {
			noConversations: "没有对话"
		},
		shortcutInfo: {
			editInline: "行内编辑",
			chatWithSelect: "与选定文本聊天",
			submitWithVault: "使用 Vault 提交"
		},
		searchResults: {
			showReferencedDocuments: "显示引用的文档"
		},
		LLMResponseInfoPopover: {
			header: "LLM 响应信息",
			tokenCount: "Token 数量",
			promptTokens: "提示 Tokens",
			completionTokens: "补全 Tokens",
			totalTokens: "总 Tokens",
			model: "模型",
			estimatedPrice: "预估价格",
			usageNotAvailable: "此模型无法获取使用统计信息",
			notAvailable: "不可用"
		},
		queryProgress: {
			readingMentionableFiles: "正在读取提及的文件",
			indexing: "正在索引",
			file: "文件",
			chunkIndexed: "块已索引",
			queryingVault: "正在查询 Vault",
			readingRelatedFiles: "正在读取相关文件"
		},
		reactMarkdown: {
			allow: "允许",
			allowing: "正在允许...",
			success: "成功",
			failed: "失败",
			switchToMode: '切换到 "{mode}" 模式',
			semanticSearchInPath: '在 {path} 中语义搜索文件 "{query}"',
			webSearch: "网页搜索：{query}",
			searching: "正在搜索...",
			done: "完成",
			searchAndReplaceInPath: "在 {path} 中搜索和替换",
			applying: "正在应用...",
			apply: "应用",
			reasoning: "推理",
			readFile: "读取文件：{path}",
			listFiles: "列出文件：{path}",
			fetchUrlsContent: "获取 URL 内容",
			fetching: "正在获取...",
			copied: "已复制",
			copy: "复制",
			editOrApplyDiff: "{mode}：{path}",
			loading: "加载中...",
			regexSearchInPath: '在 {path} 中正则搜索文件 "{regex}"',
			createNewNote: "创建新笔记",
			copyMsg: "复制消息",
			taskCompletion: "任务完成",
			askFollowupQuestion: "询问后续问题：",
			viewDetails: "查看详情"
		},
		input: {
			submit: "提交",
			collectedModels: "收集的模型",
			loading: "加载中...",
			image: "图片",
			createCommand: "创建命令",
			uploadNewImage: "上传新图片"
		}
	},
	inlineEdit: {
		placeholder: "输入指令，Enter 提交，Esc 关闭",
		fetchModelsError: "获取 Provider 模型失败：",
		submitting: "提交中...",
		submit: "提交",
		ragNotNeeded: "行内编辑不需要 RAG",
		noActiveFile: "没有活动文件",
		noActiveEditor: "没有活动编辑器",
		noTextSelected: "未选择文本",
		noActiveContext: "没有活动文件、编辑器或选区",
		invalidChatModel: "无效的聊天模型",
		emptyLLMResponse: "LLM 返回空响应",
		invalidActiveFile: "无效的活动文件",
		readFileError: "读取文件失败：",
		applyChangesError: "应用更改失败",
		inlineEditError: "行内编辑出错：",
	},
	prompt: {
		"title": "模型提示词设置",
		"description": "点击 + 创建新模式",
		"modeName": "模式名称",
		"modeNameDescription": "模式描述",
		"modeNamePlaceholder": "请输入模式名称...",
		"builtinModeNameWarning": "内置模式名称无法修改",
		"modeNameRequirements": "模式名称只能包含字母、数字和连字符",
		"roleDefinition": "角色定义",
		"roleDefinitionDescription": "设置专业领域和回复风格",
		"roleDefinitionPlaceholder": "请输入角色定义...",
		"availableFeatures": "可用功能",
		"builtinFeaturesWarning": "内置模式的可用功能不能修改",
		"readFiles": "读取文件",
		"editFiles": "编辑文件",
		"webSearch": "网络搜索",
		"modeSpecificRules": "模式特定规则（可选）",
		"modeSpecificRulesDescription": "模式特定规则",
		"modeSpecificRulesPlaceholder": "请输入模式自定义指令...",
		"supportReadingConfig": "支持从以下位置读取配置",
		"file": "文件",
		"overrideSystemPrompt": "覆盖系统提示",
		"overrideDescription": "您可以通过创建文件来完全替换此模式的系统提示（不包括角色定义和自定义指令）",
		"overrideWarning": "。这是一个非常高级的功能，将覆盖所有内置提示，包括工具使用，请谨慎使用",
		"previewSystemPrompt": "预览系统提示",
		"save": "保存"
	},
	command: {
		"createQuickCommand": "创建快捷命令",
		"name": "名称",
		"content": "内容",
		"createCommand": "创建命令",
		"searchPlaceholder": "搜索命令...",
		"noCommandsFound": "未找到命令",
		"updateCommand": "更新命令",
		"errorContentRequired": "请输入模板内容",
		"errorNameRequired": "请输入模板名称"
	},
	main: {
		openNewChat: "打开新聊天",
		openInfioCopilot: '打开 Infio Copilot',
		addSelectionToChat: '将选定内容添加到聊天',
		rebuildVaultIndex: '重建整个 Vault 索引',
		updateVaultIndex: '更新已修改文件的索引',
		autocompleteAccept: '接受自动完成',
		autocompletePredict: '手动触发自动完成',
		autocompleteToggle: '切换自动完成',
		autocompleteEnable: '启用自动完成',
		autocompleteDisable: '禁用自动完成',
		inlineEditCommand: '文本内编辑',
	},
	notifications: {
		rebuildingIndex: '正在重建 Vault 索引...',
		indexingChunks: '正在索引块：{completedChunks} / {totalChunks}',
		rebuildComplete: 'Vault 索引重建完成',
		rebuildFailed: 'Vault 索引重建失败',
		updatingIndex: '正在更新 Vault 索引...',
		updateComplete: 'Vault 索引已更新',
		updateFailed: 'Vault 索引更新失败',
		selectTextFirst: '请先选择一些文本',
		migrationFailed: '迁移到 JSON 存储失败。请检查控制台以获取详细信息。',
		reloadingInfio: '因迁移而重新加载 "infio"',
	},
	applyView: {
		applyingFile: '正在应用: {{file}}',
		acceptChanges: '接受更改',
		acceptAll: '全部接受 {{shortcut}}',
		rejectChanges: '拒绝更改',
		rejectAll: '全部拒绝 {{shortcut}}',
		fileNotFound: '文件未找到',
		acceptLine: '接受此行',
		excludeLine: '排除此行',
	},
	previewView: {
		close: '关闭预览',
	}
};
