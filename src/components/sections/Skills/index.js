import React from 'react';
import style from './index.module.scss';

import CardSkill from '@/components/UI/CardSkill';
import { cardItems } from '@/constants/constants';

const SectionSkill = () => {
  return (
    <div className={style.section_skill_cont}>
      <div className={style.middle_wrapper}>
        {cardItems.map((item, index) => (
          <CardSkill key={index} cardTitle={item.cardTitle} />
        ))}
      </div>
    </div>
  );
};

export default SectionSkill;
