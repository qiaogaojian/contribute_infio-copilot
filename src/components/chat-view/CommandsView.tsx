import { Pencil, Save, Search, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface Command {
	id: string
	title: string
	content: string
}

const CommandsView = () => {
	const [commands, setCommands] = useState<Command[]>([])
	const [newCommand, setNewCommand] = useState<Command>({
		id: uuidv4(),
		title: '',
		content: ''
	})
	const [searchTerm, setSearchTerm] = useState('')
	const [editingCommandId, setEditingCommandId] = useState<string | null>(null)

	const titleInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())
	const contentInputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())

	// 从本地存储加载commands
	useEffect(() => {
		const savedCommands = localStorage.getItem('commands')
		if (savedCommands) {
			try {
				const parsedData = JSON.parse(savedCommands)

				// 验证解析的数据是否为符合Prompt接口的数组
				if (Array.isArray(parsedData) && parsedData.every(isCommand)) {
					setCommands(parsedData)
				}
			} catch (error) {
				console.error('无法解析保存的命令', error)
			}
		}
	}, [])

	// 类型守卫函数，用于验证对象是否符合Command接口
	function isCommand(item: unknown): item is Command {
		if (!item || typeof item !== 'object') {
			return false;
		}

		// 使用in操作符检查属性存在
		if (!('id' in item) || !('title' in item) || !('content' in item)) {
			return false;
		}

		// 使用JavaScript的hasOwnProperty和typeof来检查属性类型
		return (
			Object.prototype.hasOwnProperty.call(item, 'id') &&
			Object.prototype.hasOwnProperty.call(item, 'title') &&
			Object.prototype.hasOwnProperty.call(item, 'content') &&
			typeof Reflect.get(item, 'id') === 'string' &&
			typeof Reflect.get(item, 'title') === 'string' &&
			typeof Reflect.get(item, 'content') === 'string'
		);
	}

	// 保存commands到本地存储
	useEffect(() => {
		localStorage.setItem('commands', JSON.stringify(commands))
	}, [commands])

	// 处理新command的标题变化
	const handleNewCommandTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewCommand({ ...newCommand, title: e.target.value })
	}

	// 处理新command的内容变化
	const handleNewCommandContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setNewCommand({ ...newCommand, content: e.target.value })
	}

	// 添加新command
	const handleAddCommand = () => {
		if (newCommand.title.trim() === '' || newCommand.content.trim() === '') {
			return
		}

		setCommands([...commands, newCommand])
		setNewCommand({
			id: uuidv4(),
			title: '',
			content: ''
		})
	}

	// 删除command
	const handleDeleteCommand = (id: string) => {
		setCommands(commands.filter(command => command.id !== id))
		if (editingCommandId === id) {
			setEditingCommandId(null)
		}
	}

	// 编辑command
	const handleEditCommand = (command: Command) => {
		setEditingCommandId(command.id)
	}

	// 保存编辑后的command
	const handleSaveEdit = (id: string) => {
		const titleInput = titleInputRefs.current.get(id)
		const contentInput = contentInputRefs.current.get(id)

		if (titleInput && contentInput) {
			setCommands(
				commands.map(command =>
					command.id === id
						? { ...command, title: titleInput.value, content: contentInput.value }
						: command
				)
			)
			setEditingCommandId(null)
		}
	}

	// 处理搜索
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}

	// 过滤commands列表
	const filteredCommands = commands.filter(
		command =>
			command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			command.content.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<div className="infio-commands-container">
			{/* header */}
			<div className="infio-commands-header">
				<div className="infio-commands-new">
					<h2 className="infio-commands-header-title">Create Quick Command</h2>
					<div className="infio-commands-label">Name</div>
					<input
						type="text"
						placeholder="Input Command Name"
						value={newCommand.title}
						onChange={handleNewCommandTitleChange}
						className="infio-commands-input"
					/>
					<div className="infio-commands-label">Content</div>
					<textarea
						placeholder="Input Command Content"
						value={newCommand.content}
						onChange={handleNewCommandContentChange}
						className="infio-commands-textarea"
					/>
					{/* <div className="infio-commands-hint">English identifier (lowercase letters + numbers + hyphens)</div> */}
					<button
						onClick={handleAddCommand}
						className="infio-commands-add-btn"
						disabled={!newCommand.title.trim() || !newCommand.content.trim()}
					>
						<span>Create Command</span>
					</button>
				</div>
			</div>

			{/* search bar */}
			<div className="infio-commands-search">
				<Search size={18} className="infio-commands-search-icon" />
				<input
					type="text"
					placeholder="Search Command..."
					value={searchTerm}
					onChange={handleSearch}
					className="infio-commands-search-input"
				/>
			</div>

			{/* commands list */}
			<div className="infio-commands-list">
				{filteredCommands.length === 0 ? (
					<div className="infio-commands-empty">
						<p>No commands found</p>
					</div>
				) : (
					filteredCommands.map(command => (
						<div key={command.id} className="infio-commands-item">
							{editingCommandId === command.id ? (
								// edit mode
								<div className="infio-commands-edit-mode">
									<input
										type="text"
										defaultValue={command.title}
										className="infio-commands-edit-title"
										ref={(el) => {
											if (el) titleInputRefs.current.set(command.id, el)
										}}
									/>
									<textarea
										defaultValue={command.content}
										className="infio-commands-textarea"
										ref={(el) => {
											if (el) contentInputRefs.current.set(command.id, el)
										}}
									/>
									<div className="infio-commands-actions">
										<button
											onClick={() => handleSaveEdit(command.id)}
											className="infio-commands-btn"
										>
											<Save size={16} />
										</button>
									</div>
								</div>
							) : (
								// view mode
								<div className="infio-commands-view-mode">
									<div className="infio-commands-title">{command.title}</div>
									<div className="infio-commands-content">{command.content}</div>
									<div className="infio-commands-actions">
										<button
											onClick={() => handleEditCommand(command)}
												className="infio-commands-btn"
										>
											<Pencil size={16} />
										</button>
										<button
											onClick={() => handleDeleteCommand(command.id)}
												className="infio-commands-btn"
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	)
}

export default CommandsView
