import React from 'react';
import style from './index.module.scss';

import CardProject from '@/components/UI/CardProject';
import { cardItemsProject } from '@/constants/constants';

const SectionProject = () => {
  return (
    <div className={style.section_project_cont}>
      <div className={style.middle_project_wrapper}>
        {cardItemsProject.map((item, index) => (
          <CardProject
            key={index}
            cardTitle={item.cardTitle}
            cardNumber={item.cardNumber}
            cardDescription={item.cardDescription}
          />
        ))}
      </div>
    </div>
  );
};

export default SectionProject;
