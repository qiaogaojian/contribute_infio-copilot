import { Platform } from 'obsidian';
import React from 'react';

import { t } from '../../lang/helpers'

const ShortcutInfo: React.FC = () => {
	const modKey = Platform.isMacOS ? 'Cmd' : 'Ctrl';

	const shortcuts = [
		{
			label: t('chat.shortcutInfo.editInline'),
			shortcut: `${modKey}+Shift+K`,
		},
		{
			label: t('chat.shortcutInfo.chatWithSelect'),
			shortcut: `${modKey}+Shift+L`,
		},
		{
			label: t('chat.shortcutInfo.submitWithVault'),
			shortcut: `${modKey}+Shift+Enter`,
		}
	];

	return (
		<div className="infio-shortcut-info">
			<table className="infio-shortcut-table">
				<tbody>
					{shortcuts.map((item, index) => (
						<tr key={index} className="infio-shortcut-item">
							<td className="infio-shortcut-label">{item.label}</td>
							<td className="infio-shortcut-key"><kbd>{item.shortcut}</kbd></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ShortcutInfo;
