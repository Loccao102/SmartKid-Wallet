import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { dialog?.close(); document.body.style.overflow = overflow; if (opener?.isConnected) opener.focus() }
  }, [])
  return <dialog ref={ref} className={`student-modal ${className}`} aria-labelledby={id} onCancel={(event) => { event.preventDefault(); onClose() }}>
    <header><h2 id={id}>{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label={`Đóng ${title.toLowerCase()}`}><X size={22} /></button></header>
    {children}
  </dialog>
}
