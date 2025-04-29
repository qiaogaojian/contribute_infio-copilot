import { ChevronDown, ChevronRight, Plus, Trash2, Undo2 } from 'lucide-react';
import { getLanguage } from 'obsidian';
import React, { useEffect, useMemo, useState } from 'react';

import { PREVIEW_VIEW_TYPE } from '../../constants';
import { useApp } from '../../contexts/AppContext';
import { useDiffStrategy } from '../../contexts/DiffStrategyContext';
import { useRAG } from '../../contexts/RAGContext';
import { useSettings } from '../../contexts/SettingsContext';
import { CustomMode, GroupEntry, ToolGroup } from '../../database/json/custom-mode/types';
import { useCustomModes } from '../../hooks/use-custom-mode';
import { PreviewView, PreviewViewState } from '../../PreviewView';
import { modes as buildinModes } from '../../utils/modes';
import { openOrCreateMarkdownFile } from '../../utils/obsidian';
import { PromptGenerator, getFullLanguageName } from '../../utils/prompt-generator';

const CustomModeView = () => {
	const app = useApp()

	const {
		createCustomMode,
		deleteCustomMode,
		updateCustomMode,
		customModeList,
		customModePrompts
	} = useCustomModes()
	const { settings } = useSettings()
	const { getRAGEngine } = useRAG()
	const diffStrategy = useDiffStrategy()

	const promptGenerator = useMemo(() => {
		// @ts-expect-error
		return new PromptGenerator(getRAGEngine, app, settings, diffStrategy, customModePrompts, customModeList)
	}, [app, settings, diffStrategy, customModePrompts, customModeList])

	// 当前选择的模式
	const [selectedMode, setSelectedMode] = useState<string>('ask')
	const [isBuiltinMode, setIsBuiltinMode] = useState<boolean>(true)
	const [isAdvancedCollapsed, setIsAdvancedCollapsed] = useState(false);

	const isNewMode = React.useMemo(() => selectedMode === "add_new_mode", [selectedMode])

	// new mode config
	const [newMode, setNewMode] = useState<CustomMode>({
		id: '',
		slug: '',
		name: '',
		roleDefinition: '',
		customInstructions: '',
		groups: [],
		source: 'global',
		updatedAt: 0,
	})

	// custom mode id
	const [customModeId, setCustomModeId] = useState<string>('')

	// 模型名称
	const [modeName, setModeName] = useState<string>('')

	// 角色定义
	const [roleDefinition, setRoleDefinition] = useState<string>('')

	// 选中的工具组
	const [selectedTools, setSelectedTools] = useState<GroupEntry[]>([])

	// 自定义指令
	const [customInstructions, setCustomInstructions] = useState<string>('')

	// 当模式变更时更新表单数据
	useEffect(() => {
		//  new mode
		if (isNewMode) {
			setIsBuiltinMode(false);
			setModeName(newMode.name);
			setRoleDefinition(newMode.roleDefinition);
			setCustomInstructions(newMode.customInstructions || '');
			setSelectedTools(newMode.groups as GroupEntry[]);
			setCustomModeId('');
			return;
		}

		const builtinMode = buildinModes.find(m => m.slug === selectedMode);
		if (builtinMode) {
			setIsBuiltinMode(true);
			setModeName(builtinMode.slug);
			setRoleDefinition(builtinMode.roleDefinition);
			setCustomInstructions(builtinMode.customInstructions || '');
			setSelectedTools(builtinMode.groups as GroupEntry[]);
			setCustomModeId(''); // 内置模式没有自定义 ID
		} else {
			setIsBuiltinMode(false);
			const customMode = customModeList.find(m => m.slug === selectedMode);
			if (customMode) {
				setCustomModeId(customMode.id || '');
				setModeName(customMode.name);
				setRoleDefinition(customMode.roleDefinition);
				setCustomInstructions(customMode.customInstructions || '');
				setSelectedTools(customMode.groups);
			} else {
				console.log("error, custom mode not found")
			}
		}
	}, [selectedMode, customModeList]);


	// 处理工具组选择变更
	const handleToolChange = React.useCallback((tool: ToolGroup) => {
		if (isNewMode) {
			setNewMode((prev) => ({
				...prev,
				groups: prev.groups.includes(tool) ? prev.groups.filter(t => t !== tool) : [...prev.groups, tool]
			}))
		}
		setSelectedTools(prev => {
			if (prev.includes(tool)) {
				return prev.filter(t => t !== tool);
			} else {
				return [...prev, tool];
			}
		});
	}, [isNewMode])

	// 更新模式配置
	const handleUpdateMode = React.useCallback(async () => {
		if (!isBuiltinMode) {
			await updateCustomMode(
				customModeId,
				modeName,
				roleDefinition,
				customInstructions,
				selectedTools
			);
		}
	}, [isBuiltinMode, customModeId, modeName, roleDefinition, customInstructions, selectedTools])

	// 创建新模式
	const createNewMode = React.useCallback(async () => {
		if (!isNewMode) return;
		await createCustomMode(
			modeName,
			roleDefinition,
			customInstructions,
			selectedTools
		);
		// reset
		setNewMode({
			id: '',
			slug: '',
			name: '',
			roleDefinition: '',
			customInstructions: '',
			groups: [],
			source: 'global',
			updatedAt: 0,
		})
		setSelectedMode("add_new_mode")
	}, [isNewMode, modeName, roleDefinition, customInstructions, selectedTools])

	// 删除模式
	const deleteMode = React.useCallback(async () => {
		if (isNewMode || isBuiltinMode) return;
		await deleteCustomMode(customModeId);
		setModeName('')
		setRoleDefinition('')
		setCustomInstructions('')
		setSelectedTools([])
		setSelectedMode('add_new_mode')
	}, [isNewMode, isBuiltinMode, customModeId])

	return (
		<div className="infio-custom-modes-container">
			{/* 模式配置标题和按钮 */}
			<div className="infio-custom-modes-header">
				<div className="infio-custom-modes-title">
					<h2>模式配置</h2>
				</div>
				{/* <div className="infio-custom-modes-actions">
					<button className="infio-custom-modes-btn">
						<PlusCircle size={18} />
					</button>
					<button className="infio-custom-modes-btn">
						<Settings size={18} />
					</button>
				</div> */}
			</div>

			{/* 创建模式提示 */}
			<div className="infio-custom-modes-tip">
				点击 + 创建模式，创建一个新模式。
			</div>

			{/* 模式选择区 */}
			<div className="infio-custom-modes-builtin">
				{[...buildinModes, ...customModeList].map(mode => (
					<button
						key={mode.slug}
						className={`infio-mode-btn ${selectedMode === mode.slug ? 'active' : ''}`}
						onClick={() => { setSelectedMode(mode.slug) }}
					>
						{mode.name}
					</button>
				))}
				<button
					key={"add_new_mode"}
					className={`infio-mode-btn ${selectedMode === "add_new_mode" ? 'active' : ''}`}
					onClick={() => setSelectedMode("add_new_mode")}
				>
					<Plus size={18} />
				</button>
			</div>

			{/* 模式名称 */}
			<div className="infio-custom-modes-section">
				<div className="infio-section-header">
					<h3>模式名称</h3>
					{!isBuiltinMode && !isNewMode && (
						<button className="infio-section-btn" onClick={deleteMode}>
							<Trash2 size={16} />
						</button>
					)}
				</div>
				{
					isBuiltinMode && (
						<p className="infio-section-subtitle">内置模式名称不能被修改</p>
					)
				}
				<input
					type="text"
					value={modeName}
					onChange={(e) => {
						if (isNewMode) {
							setNewMode((prev) => ({ ...prev, name: e.target.value }))
						}
						setModeName(e.target.value)
					}}
					className="infio-custom-modes-input"
					placeholder="输入模式名称..."
					disabled={isBuiltinMode}
				/>
			</div>

			{/* 角色定义 */}
			<div className="infio-custom-modes-section">
				<div className="infio-section-header">
					<h3>角色定义</h3>
					{isBuiltinMode && (
						<button className="infio-section-btn">
							<Undo2 size={16} />
						</button>
					)}
				</div>
				<p className="infio-section-subtitle">设定专业领域和应答风格</p>
				<textarea
					className="infio-custom-textarea"
					value={roleDefinition}
					onChange={(e) => {
						if (isNewMode) {
							setNewMode((prev) => ({ ...prev, roleDefinition: e.target.value }))
						}
						setRoleDefinition(e.target.value)
					}}
					placeholder="输入角色定义..."
				/>
			</div>

			{/* 可用功能 */}
			<div className="infio-custom-modes-section">
				<div className="infio-section-header">
					<h3>可用功能</h3>
					{/* {!isBuiltinMode && (
					<button className="infio-section-btn">
						<Undo2 size={16} />
						</button>
					)} */}
				</div>
				{
					isBuiltinMode && (
						<p className="infio-section-subtitle">内置模式的可用功能不能被修改</p>
					)
				}
				<div className="infio-tools-list">
					<div className="infio-tool-item">
						<label>
							<input
								type="checkbox"
								disabled={isBuiltinMode}
								checked={selectedTools.includes('read')}
								onChange={() => handleToolChange('read')}
							/>
							读取文件
						</label>
					</div>
					<div className="infio-tool-item">
						<label>
							<input
								type="checkbox"
								disabled={isBuiltinMode}
								checked={selectedTools.includes('edit')}
								onChange={() => handleToolChange('edit')}
							/>
							编辑文件
						</label>
					</div>
					<div className="infio-tool-item">
						<label>
							<input
								type="checkbox"
								disabled={isBuiltinMode}
								checked={selectedTools.includes('research')}
								onChange={() => handleToolChange('research')}
							/>
							网络搜索
						</label>
					</div>
				</div>
			</div>

			{/* 模式专属规则 */}
			<div className="infio-custom-modes-section">
				<div className="infio-section-header">
					<h3> 模式专属规则（可选）</h3>
				</div>
				<p className="infio-section-subtitle">模式专属规则</p>
				<textarea
					className="infio-custom-textarea"
					value={customInstructions}
					onChange={(e) => {
						if (isNewMode) {
							setNewMode((prev) => ({ ...prev, customInstructions: e.target.value }))
						}
						setCustomInstructions(e.target.value)
					}}
					placeholder="输入模式自定义指令..."
				/>
				<p className="infio-section-footer">
					支持从<a href="#" className="infio-link" onClick={() => openOrCreateMarkdownFile(app, `_infio_prompts/${modeName}/rules.md`, 0)}>_infio_prompts/{modeName}/rules</a> 文件中读取配置
				</p>
			</div>

			{/* 高级, 覆盖系统提示词 */}
			<div className="infio-custom-modes-section">
				<div
					className="infio-section-header infio-section-header-collapsible"
					onClick={() => setIsAdvancedCollapsed(!isAdvancedCollapsed)}
				>
					<div className="infio-section-header-title-container">
						{isAdvancedCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
						<h6 className="infio-section-header-title">覆盖系统提示词</h6>
					</div>
				</div>
				{!isAdvancedCollapsed && (
					<>
						<p className="infio-section-subtitle">
							您可以通过在工作区创建文件
							<a href="#" className="infio-link" onClick={() => openOrCreateMarkdownFile(app, `_infio_prompts/${modeName}/system_prompt.md`, 0)}>_infio_prompts/{modeName}/system_prompt</a>
							，完全替换此模式的系统提示（角色定义和自定义指令除外）。这是一个非常高级的功能，会覆盖工具使用等全部内置提示, 请谨慎操作						<button
								className="infio-preview-btn"
								onClick={async () => {
									let filesSearchMethod = settings.filesSearchMethod
									if (filesSearchMethod === 'auto' && settings.embeddingModelId && settings.embeddingModelId !== '') {
										filesSearchMethod = 'semantic'
									}

									const userLanguage = getFullLanguageName(getLanguage())
									const systemPrompt = await promptGenerator.getSystemMessageNew(modeName, filesSearchMethod, userLanguage)
									const existingLeaf = app.workspace
										.getLeavesOfType(PREVIEW_VIEW_TYPE)
										.find(
											(leaf) =>
												leaf.view instanceof PreviewView && leaf.view.state.title === `${modeName} system prompt`
										)
									if (existingLeaf) {
										console.log(existingLeaf)
										app.workspace.setActiveLeaf(existingLeaf, { focus: true })
									} else {
										app.workspace.getLeaf(true).setViewState({
											type: PREVIEW_VIEW_TYPE,
											active: true,
											state: {
												content: systemPrompt.content as string,
												title: `${modeName} system prompt`,
											} satisfies PreviewViewState,
										})
									}
								}
								}
							>
								预览系统提示词
							</button>
						</p></>
				)}
			</div>

			{/* 保存 */}
			<div className="infio-custom-modes-actions">
				<button
					className="infio-preview-btn"
					onClick={() => {
						if (isNewMode) {
							createNewMode()
						} else {
							handleUpdateMode()
						}
					}}
				>
					保存
				</button>
			</div>

			{/* 样式 */}
			<style>
				{`
				.infio-custom-modes-container {
					display: flex;
					flex-direction: column;
					padding: 16px;
					gap: 16px;
  				color: var(--text-normal);
					height: 100%;
					overflow-y: auto;
				}

				.infio-custom-modes-input {
				  background-color: var(--background-primary) !important;
					border: 1px solid var(--background-modifier-border);
					border-radius: var(--radius-s);
					color: var(--text-normal);
					padding: var(--size-4-2);
					font-size: var(--font-ui-small);
					width: 100%;
					box-sizing: border-box;
					margin-bottom: var(--size-4-2);
				}
				
				.infio-custom-modes-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
				
				.infio-custom-modes-title h2 {
					margin: 0;
					font-size: 24px;
				}
				
				.infio-custom-modes-actions {
					display: flex;
					gap: 8px;
				}
				
				.infio-custom-modes-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					background: transparent;
					border: 1px solid #444;
					color: var(--text-normal)
					border-radius: 4px;
					padding: 6px;
					cursor: pointer;
				}
				
				.infio-custom-modes-tip {
					color: #888;
					font-size: 14px;
					margin-bottom: 8px;
				}
				
				.infio-custom-modes-builtin {
					display: flex;
					flex-wrap: wrap;
					gap: 10px;
					margin-bottom: 10px;
				}
				
				.infio-mode-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: var(--size-2-2);
					background-color: var(--interactive-accent);
					color: var(--text-on-accent);
					border: none;
					border-radius: var(--radius-s);
					padding: var(--size-2-3) var(--size-4-3);
					cursor: pointer;
					font-size: var(--font-ui-small);
					align-self: flex-start;
					margin-top: var(--size-4-2);
				}
				
				.infio-mode-btn.active {
					background-color: var(--text-accent);
				}
				
				.infio-custom-modes-custom {
					display: flex;
					flex-wrap: wrap;
					gap: 10px;
					margin-bottom: 16px;
				}
				
				.infio-mode-btn-custom {
					background-color: transparent;
					border: 1px solid #444;
					border-radius: 4px;
					padding: 6px 12px;
					color: #888;
					cursor: pointer;
					font-size: 14px;
				}
				
				.infio-mode-btn-custom.active {
					background-color: var(--text-accent);
					border-color: var(--text-accent);
					color: var(--text-normal);
				}
				
				.infio-custom-modes-section {
					margin-bottom: 16px;
				}
				
				.infio-section-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 4px;
				}
				
				.infio-section-header h3 {
					margin: 0;
					font-size: 16px;
				}
				
				.infio-section-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: transparent !important;
					border: none !important;
					box-shadow: none !important;
					color: var(--text-muted);
					padding: 0 !important;
					margin: 0 !important;
					width: 24px !important;
					height: 24px !important;

					&:hover {
						background-color: var(--background-modifier-hover) !important;
					}
				}
				
				.infio-section-subtitle {
					color: #888;
					font-size: 14px;
					margin: 4px 0 12px;
				}
				
				.infio-custom-textarea {
					background-color: var(--background-primary) !important;
					border: 1px solid var(--background-modifier-border);
					border-radius: var(--radius-s);
					color: var(--text-normal);
					padding: var(--size-4-2);
					font-size: var(--font-ui-small);
					width: 100%;
					min-height: 160px;
					resize: vertical;
					box-sizing: border-box;
				}
				
				.infio-select {
					width: 100%;
					border: 1px solid #444;
					border-radius: 4px;
					color: var(--text-normal);
					padding: 8px 12px;
					margin-bottom: 8px;
				}
				
				.infio-tools-list {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}
				
				.infio-tool-item {
					display: flex;
					align-items: center;
				}
				
				.infio-tool-item label {
					display: flex;
					align-items: center;
					gap: 8px;
					cursor: pointer;
				}
				
				.infio-code-section {
					border: 1px solid #444;
					border-radius: 4px;
					padding: 8px;
					margin-bottom: 12px;
				}
				
				.infio-code-header {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 8px;
					color: #888;
				}
				
				.infio-section-footer {
					margin-top: 0px;
					font-size: 14px;
					color: #888;
				}
				
				.infio-link {
					color: var(--text-accent);
					text-decoration: none;
				}
				
				.infio-preview-btn {
					border: 1px solid #444;
					color: var(--text-normal);
					padding: 8px 16px;
					border-radius: 4px;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					width: fit-content;
				}

				.infio-section-header-collapsible {
					cursor: pointer;
					user-select: none;
				}

				.infio-section-header-title-container {
					display: flex;
					align-items: center;
					gap: 4px;
				}

				.infio-section-header-title {
					margin: 0;
				}
				`}
			</style>
		</div>
	)
}

export default CustomModeView
