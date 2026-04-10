//=============================================================================
// CardSkill — Small badge displaying a skill name
//
// Used in the Skills section of the React UI overlay. Pure markup — every
// visual effect (hover, glow, transition) lives in the SCSS module.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// CSS module providing the badge layout and hover styles.
import style from './index.module.scss';

/**
 * CardSkill
 * Stateless presentation component for a single skill.
 *
 * @param {Object} props
 * @param {string} props.cardTitle - Name of the skill (e.g. "React").
 */
const CardSkill = ({ cardTitle }) => {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.card_skill}>
      <p className={style.card_title}>{cardTitle}</p>
    </div>
  );
};

export default CardSkill;
