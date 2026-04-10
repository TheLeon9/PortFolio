//=============================================================================
// SectionSkill — Skills section UI overlay (grid of CardSkill)
//
// React side of the Skills section. The 3D sparks live in the Three.js
// scene; this overlay simply shows the same skills as flat badges.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// Reusable badge component.
import CardSkill from '@/components/UI/CardSkill';

// Static skill list — each entry has `value` (label) and `order` (sort key).
import { skillsList } from '@/constants';

// CSS module — grid + responsive tweaks.
import style from './index.module.scss';

/**
 * SectionSkill
 * Sorts the skill list by `order` and renders a CardSkill per entry.
 */
const SectionSkill = () => {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.section_skill_cont}>
      <div className={style.middle_wrapper}>
        {[...skillsList]
          .sort((a, b) => a.order - b.order)
          .map((item, index) => (
            <CardSkill key={index} cardTitle={item.value} />
          ))}
      </div>
    </div>
  );
};

export default SectionSkill;
