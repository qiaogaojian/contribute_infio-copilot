import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Fuse, { FuseResult } from 'fuse.js'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useSettings } from '../../../contexts/SettingsContext'
import { ApiProvider } from '../../../types/llm/model'
import { GetAllProviders, GetProviderModelIds } from "../../../utils/api"

type TextSegment = {
	text: string;
	isHighlighted: boolean;
};

type SearchableItem = {
	id: string;
	html: string | TextSegment[];
};

type HighlightedItem = {
	id: string;
	html: TextSegment[];
};

// Reuse highlight function from ProviderModelsPicker
const highlight = (fuseSearchResult: Array<FuseResult<SearchableItem>>): HighlightedItem[] => {
	const set = (obj: Record<string, unknown>, path: string, value: TextSegment[]): void => {
		const pathValue = path.split(".")
		let i: number
		let current = obj as Record<string, unknown>

		for (i = 0; i < pathValue.length - 1; i++) {
			const nextValue = current[pathValue[i]]
			if (typeof nextValue === 'object' && nextValue !== null) {
				current = nextValue as Record<string, unknown>
			} else {
				throw new Error(`Invalid path: ${path}`)
			}
		}

		current[pathValue[i]] = value
	}

	const mergeRegions = (regions: [number, number][]): [number, number][] => {
		if (regions.length === 0) return regions
		regions.sort((a, b) => a[0] - b[0])
		const merged: [number, number][] = [regions[0]]
		for (let i = 1; i < regions.length; i++) {
			const last = merged[merged.length - 1]
			const current = regions[i]
			if (current[0] <= last[1] + 1) {
				last[1] = Math.max(last[1], current[1])
			} else {
				merged.push(current)
			}
		}
		return merged
	}

	const generateHighlightedSegments = (inputText: string, regions: [number, number][] = []): TextSegment[] => {
		if (regions.length === 0) {
			return [{ text: inputText, isHighlighted: false }];
		}

		const mergedRegions = mergeRegions(regions);
		const segments: TextSegment[] = [];
		let nextUnhighlightedRegionStartingIndex = 0;

		mergedRegions.forEach((region) => {
			const start = region[0];
			const end = region[1];
			const lastRegionNextIndex = end + 1;

			if (nextUnhighlightedRegionStartingIndex < start) {
				segments.push({
					text: inputText.substring(nextUnhighlightedRegionStartingIndex, start),
					isHighlighted: false,
				});
			}

			segments.push({
				text: inputText.substring(start, lastRegionNextIndex),
				isHighlighted: true,
			});

			nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
		});

		if (nextUnhighlightedRegionStartingIndex < inputText.length) {
			segments.push({
				text: inputText.substring(nextUnhighlightedRegionStartingIndex),
				isHighlighted: false,
			});
		}

		return segments;
	}

	return fuseSearchResult
		.filter(({ matches }) => matches && matches.length)
		.map(({ item, matches }): HighlightedItem => {
			const highlightedItem: HighlightedItem = {
				id: item.id,
				html: typeof item.html === 'string' ? [{ text: item.html, isHighlighted: false }] : [...item.html]
			}

			matches?.forEach((match) => {
				if (match.key && typeof match.value === "string" && match.indices) {
					const mergedIndices = mergeRegions([...match.indices])
					set(highlightedItem, match.key, generateHighlightedSegments(match.value, mergedIndices))
				}
			})

			return highlightedItem
		})
}

const HighlightedText: React.FC<{ segments: TextSegment[] }> = ({ segments }) => {
	return (
		<>
			{segments.map((segment, index) => (
				segment.isHighlighted ? (
					<span key={index} className="infio-llm-setting-model-item-highlight">{segment.text}</span>
				) : (
					<span key={index}>{segment.text}</span>
				)
			))}
		</>
	);
};

export function ModelSelect() {
	const { settings, setSettings } = useSettings()
	const [isOpen, setIsOpen] = useState(false)
	const [modelProvider, setModelProvider] = useState(settings.chatModelProvider)
	const [chatModelId, setChatModelId] = useState(settings.chatModelId)
	const [modelIds, setModelIds] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedIndex, setSelectedIndex] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)

	const providers = GetAllProviders()

	useEffect(() => {
		const fetchModels = async () => {
			setIsLoading(true)
			try {
				const models = await GetProviderModelIds(modelProvider)
				setModelIds(models)
			} catch (error) {
				console.error('Failed to fetch provider models:', error)
				setModelIds([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchModels()
	}, [modelProvider])

	// Sync chat model id & chat model provider
	useEffect(() => {
		setModelProvider(settings.chatModelProvider)
		setChatModelId(settings.chatModelId)
	}, [settings.chatModelProvider, settings.chatModelId])

	const searchableItems = useMemo(() => {
		return modelIds.map((id) => ({
			id,
			html: id,
		}))
	}, [modelIds])

	const fuse = useMemo(() => {
		return new Fuse<SearchableItem>(searchableItems, {
			keys: ["html"],
			threshold: 0.6,
			shouldSort: true,
			isCaseSensitive: false,
			ignoreLocation: false,
			includeMatches: true,
			minMatchCharLength: 1,
		})
	}, [searchableItems])

	const filteredOptions = useMemo(() => {
		const results: HighlightedItem[] = searchTerm
			? highlight(fuse.search(searchTerm))
			: searchableItems.map(item => ({
				...item,
				html: typeof item.html === 'string' ? [{ text: item.html, isHighlighted: false }] : item.html
			}))
		return results
	}, [searchableItems, searchTerm, fuse])

	return (
		<>
			<DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenu.Trigger className="infio-chat-input-model-select">
					<div className="infio-chat-input-model-select__icon">
						{isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
					</div>
					<div className="infio-chat-input-model-select__model-name">
						{chatModelId}
					</div>
				</DropdownMenu.Trigger>

				<DropdownMenu.Portal>
					<DropdownMenu.Content className="infio-popover infio-llm-setting-combobox-dropdown">
						<div className="infio-llm-setting-search-container">
							<div className="infio-llm-setting-provider-container">
								<select
									className="infio-llm-setting-provider-switch"
									value={modelProvider}
									onChange={(e) => {
										const newProvider = e.target.value as ApiProvider
										setModelProvider(newProvider)
										setSearchTerm("")
										setSelectedIndex(0)
									}}
								>
									{providers.map((provider) => (
										<option
											key={provider}
											value={provider}
											className={`infio-llm-setting-provider-option ${provider === modelProvider ? 'is-active' : ''}`}
										>
											{provider}
										</option>
									))}
								</select>
							</div>
							{modelIds.length > 0 ? (
								<div className="infio-search-input-container">
									<input
										type="text"
										className="infio-llm-setting-item-search"
										placeholder="search model..."
										ref={inputRef}
										value={searchTerm}
										onChange={(e) => {
											setSearchTerm(e.target.value)
											setSelectedIndex(0)
											// 确保下一个渲染循环中仍然聚焦在输入框
											setTimeout(() => {
												inputRef.current?.focus()
											}, 0)
										}}
										onKeyDown={(e) => {
											switch (e.key) {
												case "ArrowDown":
													e.preventDefault()
													setSelectedIndex((prev) =>
														Math.min(prev + 1, filteredOptions.length - 1)
													)
													break
												case "ArrowUp":
													e.preventDefault()
													setSelectedIndex((prev) => Math.max(prev - 1, 0))
													break
												case "Enter": {
													e.preventDefault()
													const selectedOption = filteredOptions[selectedIndex]
													if (selectedOption) {
														setSettings({
															...settings,
															chatModelProvider: modelProvider,
															chatModelId: selectedOption.id,
														})
														setChatModelId(selectedOption.id)
														setSearchTerm("")
														setIsOpen(false)
													}
													break
												}
												case "Escape":
													e.preventDefault()
													setIsOpen(false)
													setSearchTerm("")
													break
											}
										}}
									/>
								</div>
							) : (
								<input
									type="text"
									className="infio-llm-setting-item-search"
									placeholder="input custom model name"
									ref={inputRef}
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value)
										// 确保下一个渲染循环中仍然聚焦在输入框
										setTimeout(() => {
											inputRef.current?.focus()
										}, 0)
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault()
											setSettings({
												...settings,
												chatModelProvider: modelProvider,
												chatModelId: searchTerm,
											})
											setChatModelId(searchTerm)
											setIsOpen(false)
										}
									}}
								/>
							)}
						</div>
						<ul>
							{isLoading ? (
								<li>Loading...</li>
							) : (
								filteredOptions.map((option, index) => (
									<DropdownMenu.Item
										key={option.id}
										onSelect={() => {
											setSettings({
												...settings,
												chatModelProvider: modelProvider,
												chatModelId: option.id,
											})
											setChatModelId(option.id)
											setSearchTerm("")
											setIsOpen(false)
										}}
										className={`infio-llm-setting-combobox-option ${index === selectedIndex ? 'is-selected' : ''}`}
										onMouseEnter={() => setSelectedIndex(index)}
										asChild
									>
										<li
											className="infio-llm-setting-model-item"
											title={option.id}
										>
											<div className="infio-model-item-text-wrapper">
												<HighlightedText segments={option.html} />
											</div>
										</li>
									</DropdownMenu.Item>
								))
							)}
						</ul>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>
			<style>
				{`
					/* 模型项样式 */
					.infio-llm-setting-model-item {
						display: block;
						padding: 0;
						transition: background-color 0.2s ease;
					}
					
					.infio-llm-setting-combobox-option:hover {
						background-color: var(--background-modifier-hover);
					}
					
					.infio-llm-setting-combobox-option.is-selected {
						background-color: var(--background-modifier-active);
						border-left: 3px solid var(--interactive-accent);
					}
					
					/* 文本溢出处理 */
					.infio-model-item-text-wrapper {
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
						max-width: 280px;
						display: block;
					}
					
					.infio-model-item-text-wrapper span {
						display: inline;
					}

					/* 高亮样式 - 使用紫色而不是主题色 */
					.infio-llm-setting-model-item-highlight {
						display: inline;
						color: #9370DB;
						font-weight: 700;
						background-color: rgba(147, 112, 219, 0.1);
						padding: 0 2px;
						border-radius: 2px;
					}
					
					/* 搜索容器 */
					.infio-llm-setting-search-container {
						display: flex;
						flex-direction: row;
						justify-content: space-between;
						gap: 5px;
						border-bottom: 1px solid var(--background-modifier-border);
						padding-bottom: 2px;
					}
					
					/* 提供商选择器容器 */
					.infio-llm-setting-provider-container {
						position: relative;
						display: flex;
						align-items: center;
						flex: 0 0 auto;
						width: 26%;
					}
					
					/* 移除提供商选择箭头 */
					
					/* 提供商选择器 */
					.infio-llm-setting-provider-switch {
						width: 100% !important;
						margin: 0;
						padding: 0;
						padding-right: 5px;
						text-align: left;
						appearance: none;
						-webkit-appearance: none;
						background-color: var(--background-modifier-form-field);
						border: 1px solid var(--background-modifier-border);
						font-weight: 500;
						transition: border-color 0.2s ease, box-shadow 0.2s ease;
						cursor: pointer;
					}
					
					.infio-llm-setting-provider-switch:hover {
						border-color: var(--interactive-accent-hover);
					}
					
					.infio-llm-setting-provider-switch:focus {
						border-color: var(--interactive-accent);
						box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.2);
					}
					
					/* 搜索框容器 */
					.infio-search-input-container {
						position: relative;
						display: flex;
						align-items: center;
						flex: 1 1 auto;
						width: 74%;
					}
					
					/* 移除搜索图标 */
					
					/* 搜索输入框 */
					.infio-llm-setting-item-search {
						width: 100% !important;
						border: 1px solid var(--background-modifier-border);
						margin: 0;
						padding: 0;
						border-radius: 0px !important;
						background-color: var(--background-modifier-form-field);
						transition: border-color 0.2s ease, box-shadow 0.2s ease;
						height: 28px;
						padding-left: 8px;
					}
					
					.infio-llm-setting-item-search:hover {
						border-color: var(--interactive-accent-hover);
					}
					
					.infio-llm-setting-item-search:focus {
						border-color: var(--interactive-accent);
						box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.2);
						outline: none;
					}
					
					/* 下拉菜单容器 */
					.infio-llm-setting-combobox-dropdown {
						max-height: 350px;
						overflow-y: auto;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
						border-radius: 8px;
					}
				`}
			</style>
		</>
	)
}
