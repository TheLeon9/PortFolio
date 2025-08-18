import React from 'react';
import style from './index.module.scss';

import CardSkill from '@/components/UI/CardSkill';
import { useConstants } from '@/context/ConstantsContext';

const SectionSkill = () => {

  const { skills } = useConstants();
  
  return (
    <div className={style.section_skill_cont}>
      <div className={style.middle_wrapper}>
        {skills
          .sort((a, b) => a.order - b.order)
          .map((item, index) => (
            <CardSkill key={index} cardTitle={item.value} />
          ))}
      </div>
    </div>
  );
};

export default SectionSkill;
