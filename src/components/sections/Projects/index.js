//=============================================================================
// SectionProject — Projects section UI overlay (list of CardProject)
//
// React side of the Projects section. The 3D rotating rings are handled by
// the Three.js scene; this overlay shows a flat grid of cards sorted by
// `projectNumber`.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// Reusable card component for a single project entry.
import CardProject from '@/components/UI/CardProject';

// Static project list (title, description, project number, ...).
import { projectsList } from '@/constants';

// CSS module: grid layout + responsive tweaks.
import style from './index.module.scss';

/**
 * SectionProject
 * Sorts the project list by number and renders one CardProject per entry.
 */
const SectionProject = () => {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.section_project_cont}>
      <div className={style.middle_project_wrapper}>
        {[...projectsList]
          // Spread + sort instead of mutating the original constant.
          .sort((a, b) => a.projectNumber - b.projectNumber)
          .map((item, index) => (
            <CardProject
              key={index}
              cardTitle={item.title}
              cardNumber={item.projectNumber}
              cardDescription={item.description}
            />
          ))}
      </div>
    </div>
  );
};

export default SectionProject;
