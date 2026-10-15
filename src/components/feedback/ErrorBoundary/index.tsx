import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  fallback: ReactNode
  onError: (error: Error) => void
  children: ReactNode
}

interface ErrorBoundaryState {
  failed: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error('Scene failed, switching to the 2D layout', error)
    this.props.onError(error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
