import { CornerDownLeftIcon } from 'lucide-react'

import { t } from '../../../lang/helpers'

export function SubmitButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="infio-chat-user-input-submit-button" onClick={onClick}>
      {t('chat.input.submit')}
      <div className="infio-chat-user-input-submit-button-icons">
        <CornerDownLeftIcon size={12} />
      </div>
    </button>
  )
}
