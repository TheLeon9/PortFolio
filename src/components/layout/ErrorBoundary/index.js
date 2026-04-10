//=============================================================================
// ErrorBoundary — Catch React errors thrown by the 3D scene and show fallback
//
// React error boundaries can only be implemented as class components, hence
// this remains a class. The boundary wraps the <canvas> element so that any
// crash inside the Three.js init or React tree below it shows a friendly
// "something went wrong" message instead of a white screen.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

//-- Constants ----------------------------------------------------------------

// Inline style for the fallback container — kept inline because it must keep
// working even if the SCSS bundle failed to load.
const FALLBACK_STYLE = {
  position: 'fixed',
  inset: 0,                           // shorthand for top/right/bottom/left = 0
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f8ff',         // off-white brand background
  color: '#040b12',                   // brand near-black
  fontFamily: 'Nunito, sans-serif',
  textAlign: 'center',
  padding: '2rem',
};

// Inline style for the refresh button (same robustness reason).
const REFRESH_BTN_STYLE = {
  marginTop: '1rem',
  padding: '0.5rem 1.5rem',
  border: '2px solid #0132b5',        // brand blue border
  background: 'none',
  color: '#0132b5',                   // brand blue text
  cursor: 'pointer',
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '14px',
};

/**
 * ErrorBoundary
 * Wraps its children. If any descendant throws during render, this component
 * catches it via React's error boundary lifecycle and shows the fallback UI.
 */
class ErrorBoundary extends React.Component {
  //-- State / Refs -----------------------------------------------------------
  constructor(props) {
    super(props);
    // `hasError` flips to true after a thrown error, triggering the fallback.
    this.state = { hasError: false };
  }

  //-- Lifecycle --------------------------------------------------------------

  /**
   * getDerivedStateFromError
   * Static lifecycle method — runs during the render phase to update state
   * before the next render.
   */
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /**
   * componentDidCatch
   * Side-effect-friendly lifecycle method — runs after the error has been
   * captured. Used here to log to the console; could push to Sentry etc.
   */
  componentDidCatch(error, errorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
  }

  //-- Render -----------------------------------------------------------------
  render() {
    if (this.state.hasError) {
      // Fallback UI — full-screen overlay with a refresh button.
      return (
        <div style={FALLBACK_STYLE}>
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Something went wrong</h2>
            <p>The 3D scene failed to load. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              style={REFRESH_BTN_STYLE}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    // No error → render the children untouched.
    return this.props.children;
  }
}

export default ErrorBoundary;
