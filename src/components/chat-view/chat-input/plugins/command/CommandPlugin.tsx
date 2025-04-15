
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import clsx from 'clsx'
import {
	$parseSerializedNode,
	COMMAND_PRIORITY_NORMAL, SerializedLexicalNode, TextNode
} from 'lexical'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { lexicalNodeToPlainText } from '../../../../../components/chat-view/chat-input/utils/editor-state-to-plain-text'
import { useDatabase } from '../../../../../contexts/DatabaseContext'
import { DBManager } from '../../../../../database/database-manager'
import { MenuOption } from '../shared/LexicalMenu'
import {
	LexicalTypeaheadMenuPlugin,
	useBasicTypeaheadTriggerMatch,
} from '../typeahead-menu/LexicalTypeaheadMenuPlugin'


export type Command = {
	id: string
	name: string
	content: { nodes: SerializedLexicalNode[] }
	createdAt: Date
	updatedAt: Date
}


class CommandTypeaheadOption extends MenuOption {
	name: string
	command: Command

	constructor(name: string, command: Command) {
		super(name)
		this.name = name
		this.command = command
	}
}

function CommandMenuItem({
	index,
	isSelected,
	onClick,
	onMouseEnter,
	option,
}: {
	index: number
	isSelected: boolean
	onClick: () => void
	onMouseEnter: () => void
	option: CommandTypeaheadOption
}) {
	return (
		<li
			key={option.key}
			tabIndex={-1}
			className={clsx('item', isSelected && 'selected')}
			ref={(el) => option.setRefElement(el)}
			role="option"
			aria-selected={isSelected}
			id={`typeahead-item-${index}`}
			onMouseEnter={onMouseEnter}
			onClick={onClick}
		>
			<div className="smtcmp-template-menu-item">
				<div className="text">{option.name}</div>
			</div>
		</li>
	)
}

export default function CommandPlugin() {
	const [editor] = useLexicalComposerContext()
	const [commands, setCommands] = useState<Command[]>([])

	const { getDatabaseManager } = useDatabase()
	const getManager = useCallback(async (): Promise<DBManager> => {
		return await getDatabaseManager()
	}, [getDatabaseManager])

	const fetchCommands = useCallback(async () => {
		const dbManager = await getManager()
		dbManager.getCommandManager().getAllCommands((rows) => {
			setCommands(rows.map((row) => ({
				id: row.id,
				name: row.name,
				content: row.content,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			})))
		})
	}, [getManager])

	useEffect(() => {
		void fetchCommands()
	}, [fetchCommands])

	const [queryString, setQueryString] = useState<string | null>(null)
	const [searchResults, setSearchResults] = useState<Command[]>([])

	useEffect(() => {
		if (queryString == null) return
		const filteredCommands = commands.filter(
			command =>
				command.name.toLowerCase().includes(queryString.toLowerCase()) ||
				command.content.nodes.map(lexicalNodeToPlainText).join('').toLowerCase().includes(queryString.toLowerCase())
		)
		setSearchResults(filteredCommands)
	}, [queryString, commands])

	const options = useMemo(
		() =>
			searchResults.map(
				(result) => new CommandTypeaheadOption(result.name, result),
			),
		[searchResults],
	)

	const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
		minLength: 0,
	})

	const onSelectOption = useCallback(
		(
			selectedOption: CommandTypeaheadOption,
			nodeToRemove: TextNode | null,
			closeMenu: () => void,
		) => {
			editor.update(() => {
				const parsedNodes = selectedOption.command.content.nodes.map((node) =>
					$parseSerializedNode(node),
				)
				if (nodeToRemove) {
					const parent = nodeToRemove.getParentOrThrow()
					parent.splice(nodeToRemove.getIndexWithinParent(), 1, parsedNodes)
					const lastNode = parsedNodes[parsedNodes.length - 1]
					lastNode.selectEnd()
				}
				closeMenu()
			})
		},
		[editor],
	)

	return (
		<LexicalTypeaheadMenuPlugin<CommandTypeaheadOption>
			onQueryChange={setQueryString}
			onSelectOption={onSelectOption}
			triggerFn={checkForTriggerMatch}
			options={options}
			commandPriority={COMMAND_PRIORITY_NORMAL}
			menuRenderFn={(
				anchorElementRef,
				{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
			) =>
				anchorElementRef.current && searchResults.length
					? createPortal(
						<div
							className="smtcmp-popover"
							style={{
								position: 'fixed',
							}}
						>
							<ul>
								{options.map((option, i: number) => (
									<CommandMenuItem
										index={i}
										isSelected={selectedIndex === i}
										onClick={() => {
											setHighlightedIndex(i)
											selectOptionAndCleanUp(option)
										}}
										onMouseEnter={() => {
											setHighlightedIndex(i)
										}}
										key={option.key}
										option={option}
									/>
								))}
							</ul>
						</div>,
						anchorElementRef.current,
					)
					: null
			}
		/>
	)
}
