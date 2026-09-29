import { Download, FileJson, Table2 } from 'lucide-react'
import { researchEventsToCsv } from '../../domain/researchEvents'
import { useResearchLogStore } from '../../store/researchLog'

function downloadTextFile(
  filename: string,
  content: string,
  type: string,
) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}

export function ResearchExportPanel({ shiftId }: { shiftId: string }) {
  const events = useResearchLogStore((state) => state.events)

  const shiftEvents = events.filter((event) => event.shiftId === shiftId)
  const latestSessionId =
    [...shiftEvents]
      .reverse()
      .find((event) => event.eventType === 'shift_completed')?.sessionId ??
    shiftEvents.at(-1)?.sessionId

  const sessionEvents = latestSessionId
    ? shiftEvents.filter((event) => event.sessionId === latestSessionId)
    : []

  const baseName =
    'smartkid-' +
    shiftId.replace(/[^a-zA-Z0-9-_]/g, '-') +
    '-' +
    (latestSessionId?.slice(-8) ?? 'no-session')

  return (
    <section className="research-export-panel">
      <div className="research-export-heading">
        <span aria-hidden="true">
          <Download size={18} />
        </span>
        <div>
          <strong>Dữ liệu nghiên cứu của ca</strong>
          <p>
            {sessionEvents.length} event · schema v1 · session{' '}
            {latestSessionId ? latestSessionId.slice(-8) : 'chưa có'}
          </p>
        </div>
      </div>

      <div className="research-export-actions">
        <button
          type="button"
          disabled={sessionEvents.length === 0}
          onClick={() =>
            downloadTextFile(
              baseName + '.json',
              JSON.stringify(sessionEvents, null, 2),
              'application/json;charset=utf-8',
            )
          }
        >
          <FileJson size={15} aria-hidden="true" />
          Xuất JSON
        </button>

        <button
          type="button"
          disabled={sessionEvents.length === 0}
          onClick={() =>
            downloadTextFile(
              baseName + '.csv',
              researchEventsToCsv(sessionEvents),
              'text/csv;charset=utf-8',
            )
          }
        >
          <Table2 size={15} aria-hidden="true" />
          Xuất CSV
        </button>
      </div>
    </section>
  )
}
