//=============================================================================
// CardProject — Card displaying a single project (number, title, description)
//
// Used in the Projects section of the React UI overlay (not the 3D rings).
// Hover triggers a CSS-based reveal of the description over the card.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// CSS module — provides scoped class names for the card layout.
import style from './index.module.scss';

/**
 * CardProject
 * Stateless presentation component. All visual state (hover reveal) is
 * driven by CSS, so the component itself is just a static markup tree.
 *
 * @param {Object} props
 * @param {string} props.cardTitle       - Project name shown at the bottom.
 * @param {string|number} props.cardNumber - Sort order shown as the big number.
 * @param {string} props.cardDescription - Long-form description revealed on hover.
 */
const CardProject = ({ cardTitle, cardNumber, cardDescription }) => {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.card_project}>
      {/* Hidden by default, fades in on hover (CSS handles the transition). */}
      <div className={style.card_content}>
        <p className={style.card_project_description}>{cardDescription}</p>
      </div>
      {/* Big project number — visible by default, slides on hover. */}
      <p className={style.card_project_number}>{cardNumber}</p>
      {/* Project title — same hover slide as the number. */}
      <p className={style.card_project_title}>{cardTitle}</p>
    </div>
  );
};

export default CardProject;
