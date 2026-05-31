import type { FormEvent, FormEventHandler, MouseEventHandler, MutableRefObject } from 'react'
import type { DailyReportTeamOption } from '../api/dailyReports'

export type DailyReportModalMode = 'create' | 'edit' | 'view'

type DailyReportModalProps = {
  isOpen: boolean
  mode: DailyReportModalMode
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  today: string
  teamOptions: DailyReportTeamOption[]
  selectedTeamId: string
  lockedTeamName: string
  onSelectedTeamIdChange: (value: string) => void
  applyEditorCommand: (command: string, value?: string) => void
  onInsertLink: () => void
  textColor: string
  onTextColorChange: (value: string) => void
  highlightColor: string
  onHighlightColorChange: (value: string) => void
  editorRef: MutableRefObject<HTMLDivElement | null>
  onEditorInput: (event: FormEvent<HTMLDivElement>) => void
  onEditorClick: MouseEventHandler<HTMLDivElement>
  editorWordCount: number
  editorCharacterCount: number
  editorUpdatedAt: string
}

function DailyReportModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
  today,
  teamOptions,
  selectedTeamId,
  lockedTeamName,
  onSelectedTeamIdChange,
  applyEditorCommand,
  onInsertLink,
  textColor,
  onTextColorChange,
  highlightColor,
  onHighlightColorChange,
  editorRef,
  onEditorInput,
  onEditorClick,
  editorWordCount,
  editorCharacterCount,
  editorUpdatedAt,
}: DailyReportModalProps) {
  if (!isOpen) {
    return null
  }

  const isReadOnly = mode === 'view'
  const modalTitle = mode === 'create' ? 'Add Daily Report' : mode === 'edit' ? 'Edit Daily Report' : 'View Daily Report'
  const submitLabel = mode === 'edit' ? 'Save Changes' : 'Save Report'

  return (
    <div className="daily-report-modal-backdrop" role="presentation">
      <section
        className="daily-report-modal"
        aria-label="Add daily report"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="daily-report-modal-head">
          <h2>{modalTitle}</h2>
          <button type="button" className="daily-report-modal-close" onClick={onClose}>
            Close
          </button>
        </header>

        <form className="daily-report-modal-form" onSubmit={onSubmit}>
          <div className="daily-report-doc-meta">
            <div className="daily-report-doc-meta-field">
              <label htmlFor="dailyReportTeam">Team</label>
              {mode === 'create' ? (
                <select
                  className="daily-report-trendy-select"
                  id="dailyReportTeam"
                  value={selectedTeamId}
                  onChange={(event) => onSelectedTeamIdChange(event.target.value)}
                  disabled={teamOptions.length === 0}
                  required
                >
                  <option value="">Select team</option>
                  {teamOptions.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input id="dailyReportTeam" value={lockedTeamName} readOnly />
              )}
            </div>

            <div className="daily-report-doc-meta-field">
              <label>Save Date</label>
              <p className="daily-report-save-date">
                <strong>{today}</strong>
              </p>
            </div>
          </div>

          {!isReadOnly && (
            <div className="daily-report-editor-toolbar" role="toolbar" aria-label="Text formatting tools">
              <div className="daily-report-toolbar-group">
                <span className="daily-report-toolbar-caption">Font</span>
                <select
                  className="daily-report-trendy-select"
                  aria-label="Font family"
                  onChange={(event) => applyEditorCommand('fontName', event.target.value)}
                >
                  <option value="Calibri">Calibri</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                </select>
                <select
                  className="daily-report-trendy-select"
                  aria-label="Font size"
                  defaultValue="3"
                  onChange={(event) => applyEditorCommand('fontSize', event.target.value)}
                >
                  <option value="2">10</option>
                  <option value="3">12</option>
                  <option value="4">14</option>
                  <option value="5">18</option>
                </select>
              </div>

              <div className="daily-report-toolbar-group">
                <span className="daily-report-toolbar-caption">Style</span>
                <button type="button" onClick={() => applyEditorCommand('bold')}>
                  B
                </button>
                <button type="button" onClick={() => applyEditorCommand('italic')}>
                  I
                </button>
                <button type="button" onClick={() => applyEditorCommand('underline')}>
                  U
                </button>
                <button type="button" onClick={() => applyEditorCommand('strikeThrough')}>
                  S
                </button>
              </div>

              <div className="daily-report-toolbar-group">
                <span className="daily-report-toolbar-caption">Paragraph</span>
                <button type="button" onClick={() => applyEditorCommand('insertUnorderedList')}>
                  • List
                </button>
                <button type="button" onClick={() => applyEditorCommand('insertOrderedList')}>
                  1. List
                </button>
                <button type="button" onClick={() => applyEditorCommand('justifyLeft')}>
                  Left
                </button>
                <button type="button" onClick={() => applyEditorCommand('justifyCenter')}>
                  Center
                </button>
                <button type="button" onClick={() => applyEditorCommand('justifyRight')}>
                  Right
                </button>
              </div>

              <div className="daily-report-toolbar-group">
                <span className="daily-report-toolbar-caption">Color</span>
                <label className="daily-report-color-label">
                  Text
                  <input
                    type="color"
                    value={textColor}
                    onChange={(event) => {
                      onTextColorChange(event.target.value)
                      applyEditorCommand('foreColor', event.target.value)
                    }}
                  />
                </label>
                <label className="daily-report-color-label">
                  Highlight
                  <input
                    type="color"
                    value={highlightColor}
                    onChange={(event) => {
                      onHighlightColorChange(event.target.value)
                      applyEditorCommand('hiliteColor', event.target.value)
                    }}
                  />
                </label>
              </div>

              <div className="daily-report-toolbar-group">
                <span className="daily-report-toolbar-caption">Editing</span>
                <button type="button" onClick={onInsertLink}>
                  Insert Link
                </button>
                <button type="button" onClick={() => applyEditorCommand('undo')}>
                  Undo
                </button>
                <button type="button" onClick={() => applyEditorCommand('redo')}>
                  Redo
                </button>
                <button type="button" onClick={() => applyEditorCommand('removeFormat')}>
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="daily-report-workspace">
            <div className="daily-report-page">
              <div
                ref={editorRef}
                className="daily-report-editor"
                contentEditable={!isReadOnly}
                role="textbox"
                aria-multiline="true"
                aria-label="Daily report document editor"
                onInput={onEditorInput}
                onClick={onEditorClick}
                suppressContentEditableWarning
              />
            </div>
          </div>

          <div className="daily-report-editor-status" aria-live="polite">
            <span>{editorWordCount} words</span>
            <span>{editorCharacterCount} characters</span>
            <span>
              {editorUpdatedAt
                ? `Last edit ${new Date(editorUpdatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'Ready to write'}
            </span>
          </div>

          {teamOptions.length === 0 && (
            <p className="daily-report-sub">No teams found. Create teams first in Team Management.</p>
          )}

          <div className="daily-report-modal-actions">
            <button type="button" className="daily-report-modal-cancel" onClick={onClose}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && <button type="submit">{submitLabel}</button>}
          </div>
        </form>
      </section>
    </div>
  )
}

export default DailyReportModal
