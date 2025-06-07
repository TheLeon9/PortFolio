import React from 'react';
import style from './index.module.scss';

import CardSkill from '@/components/UI/CardSkill';
import { skillsList } from '@/constants';

const SectionSkill = () => {
  return (
    <div className={style.section_skill_cont}>
      <div className={style.middle_wrapper}>
        {skillsList.map((item, index) => (
          <CardSkill key={index} cardTitle={item.value} />
        ))}
      </div>
    </div>
  );
};

export default SectionSkill;
