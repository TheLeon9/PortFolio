//=============================================================================
// IndexPage — Main page that renders the active section (0..4)
//
// The page receives `activeSection` from the Layout (via React.cloneElement)
// and renders the matching section header + the section-specific content
// (only the Contact section has an inline component; the other sections
// rely on the 3D scene plus the SectionPresentation header).
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// Reusable header component for every section.
import SectionPresentation from '@/components/UI/SectionPresentation';

// Contact form (rendered only for the Contact section, index 4).
import SectionContact from '@/components/sections/Contact';

// Static section descriptions (title, coloured suffix, subtitle).
import { sectionsInformation } from '@/constants';

// CSS module: vertical split between top content and the section header.
import style from '@/styles/index/index.module.scss';

/**
 * IndexPage
 * Renders the section currently active. Each section has the same shell:
 * a top half for content (only Contact has any) and a bottom half for the
 * SectionPresentation header.
 *
 * @param {Object} props
 * @param {number} props.activeSection - 0..4, injected by Layout.
 */
const IndexPage = ({ activeSection }) => {
  //-- Render -----------------------------------------------------------------
  return (
    <>
      {sectionsInformation.map(
        (oneSection, index) =>
          // Only render the active section. The previous one is unmounted —
          // its 3D state is owned by the Three.js scene, so unmounting the
          // React tree doesn't break the visuals.
          activeSection === index && (
            <div
              className={`global_page_container ${style.global_page_container}`}
              key={index}
            >
              {/* Top half: section-specific content. */}
              <section className={style.section_top}>
                {/* Only the Contact section has an inline component. */}
                {index === 4 && <SectionContact />}
              </section>
              {/* Bottom half: animated section header. */}
              <section className={style.section_bot}>
                <SectionPresentation
                  key={index}
                  presentationTitle={oneSection.title}
                  presentationTitleColored={oneSection.coloredTitle}
                  presentationText={oneSection.text}
                />
              </section>
            </div>
          )
      )}
    </>
  );
};

export default IndexPage;
