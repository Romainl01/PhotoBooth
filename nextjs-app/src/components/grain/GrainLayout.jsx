'use client'

/**
 * GrainLayout - Main responsive container component
 *
 * Mobile (< 768px): Full-screen immersive experience
 * Desktop (≥ 768px): Centered container with max-width and subtle borders
 */
export default function GrainLayout({ children }) {
  return (
    <div className="grain-layout">
      <div className="grain-container">
        {children}
      </div>

      <style jsx>{`
        .grain-layout {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: var(--color-black);
        }

        .grain-container {
          width: 100%;
          height: 100%;
          position: relative;
          background-color: var(--color-black);
        }

        /* Desktop: Centered phone-sized container */
        @media (min-width: 768px) {
          .grain-container {
            max-width: 430px;
            max-height: 932px;
            border: 1px solid var(--color-dark-gray);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </div>
  )
}
