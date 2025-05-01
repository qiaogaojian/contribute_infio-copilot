import { SelectVector } from '../../database/schema'
import { t } from '../../lang/helpers'
export type QueryProgressState =
	| {
		type: 'reading-mentionables'
	}
	| {
		type: 'indexing'
		indexProgress: IndexProgress
	}
	| {
		type: 'querying'
	}
	| {
		type: 'querying-done'
		queryResult: (Omit<SelectVector, 'embedding'> & { similarity: number })[]
	}
	| {
		type: 'idle'
	}

export type IndexProgress = {
	completedChunks: number
	totalChunks: number
	totalFiles: number
}

// TODO: Update style
export default function QueryProgress({
	state,
}: {
	state: QueryProgressState
}) {
	switch (state.type) {
		case 'idle':
			return null
		case 'reading-mentionables':
			return (
				<div className="infio-query-progress">
					<p>
						{t('chat.queryProgress.readingMentionableFiles')}
						<DotLoader />
					</p>
				</div>
			)
		case 'indexing':
			return (
				<div className="infio-query-progress">
					<p>
						{`${t('chat.queryProgress.indexing')} ${state.indexProgress.totalFiles} ${t('chat.queryProgress.file')}`}
						<DotLoader />
					</p>
					<p className="infio-query-progress-detail">{`${state.indexProgress.completedChunks}/${state.indexProgress.totalChunks} ${t('chat.queryProgress.chunkIndexed')}`}</p>
				</div>
			)
		case 'querying':
			return (
				<div className="infio-query-progress">
					<p>
						{t('chat.queryProgress.queryingVault')}
						<DotLoader />
					</p>
				</div>
			)
		case 'querying-done':
			return (
				<div className="infio-query-progress">
					<p>
						{t('chat.queryProgress.readingRelatedFiles')}
						<DotLoader />
					</p>
					{state.queryResult.map((result) => (
						<div key={result.path}>
							<p>{result.path}</p>
							<p>{result.similarity}</p>
						</div>
					))}
				</div>
			)
	}
}

function DotLoader() {
	return <span className="infio-dot-loader" aria-label="Loading"></span>
}
