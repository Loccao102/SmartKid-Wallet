import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface FeatureErrorBoundaryProps {
  children: ReactNode
  resetKey: string
  onRecover: () => void
}

interface FeatureErrorBoundaryState {
  error: Error | null
}

export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  state: FeatureErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SmartKid feature crashed', error, info)
  }

  componentDidUpdate(previousProps: FeatureErrorBoundaryProps) {
    if (
      this.state.error &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ error: null })
    }
  }

  private recover = () => {
    this.setState({ error: null })
    this.props.onRecover()
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <section className="feature-error-card" role="alert">
        <span className="feature-error-icon" aria-hidden="true">
          <AlertTriangle size={28} />
        </span>
        <p className="page-kicker">SMARTKID WALLET</p>
        <h2>Màn này vừa gặp sự cố</h2>
        <p>
          Tiến trình đã lưu sẽ không bị xóa. Em có thể quay lại bản đồ và thử
          mở màn này lần nữa.
        </p>
        <button type="button" onClick={this.recover}>
          <RotateCcw size={16} aria-hidden="true" />
          Quay lại bản đồ
        </button>
      </section>
    )
  }
}
