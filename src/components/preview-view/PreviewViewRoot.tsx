import { getIcon } from 'obsidian'
import { useEffect, useRef } from 'react'

import { t } from '../../lang/helpers'
import { PreviewViewState } from '../../PreviewView'

export default function PreviewViewRoot({
	state,
	close,
}: {
	state: PreviewViewState
	close: () => void
}) {
	const closeIcon = getIcon('x')
	const contentRef = useRef<HTMLDivElement>(null)

	// 显示原始文本内容
	useEffect(() => {
		if (contentRef.current && state.content) {
			// 清空现有内容
			contentRef.current.empty()
			
			// 创建预格式化文本元素
			const preElement = document.createElement('pre')
			preElement.className = 'infio-raw-content'
			preElement.textContent = state.content
			
			// 添加到容器
			contentRef.current.appendChild(preElement)
		}
	}, [state.content, state.file])

	return (
		<div id="infio-preview-view">
			<div className="view-header">
				<div className="view-header-left">
					<div className="view-header-nav-buttons"></div>
				</div>
				<div className="view-header-title-container mod-at-start">
					<div className="view-header-title">
						{state.title || (state.file ? state.file.name : 'Markdown Preview')}
					</div>
					<div className="view-actions">
						<button
							className="clickable-icon view-action infio-close-button"
							aria-label="Close preview"
							onClick={close}
						>
							{closeIcon && '✕'}
							{t('previewView.close')}
						</button>
					</div>
				</div>
			</div>

			<div className="view-content">
				<div className="markdown-preview-view is-readable-line-width">
					<div className="markdown-preview-sizer">
						<div className="infio-preview-title">
							{state.title || (state.file ? state.file.name.replace(/\.[^/.]+$/, '') : '')}
						</div>
						<div 
							ref={contentRef} 
							className="markdown-preview-section"
						></div>
					</div>
				</div>
			</div>
			<style>{`
				#infio-preview-view {
					display: flex;
					flex-direction: column;
					height: 100%;
					background-color: var(--background-primary);
				}
				
				#infio-preview-view .view-content {
					flex-grow: 1;
					overflow: auto;
					padding: 0 20px;
				}
				
				.infio-preview-title {
					font-size: 1.8em;
					font-weight: bold;
					margin-bottom: 20px;
					padding-bottom: 10px;
					border-bottom: 1px solid var(--background-modifier-border);
				}
				
				.markdown-preview-section {
					padding: 10px 0;
				}
				
				.infio-raw-content {
					white-space: pre-wrap;
					word-break: break-word;
					font-family: var(--font-monospace);
					padding: 10px;
					background-color: var(--background-secondary);
					border-radius: 4px;
				}
			`}</style>
		</div>
	)
} 
