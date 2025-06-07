import React from 'react';
import style from './index.module.scss';

import CardProject from '@/components/UI/CardProject';
import { projectsList } from '@/constants';

const SectionProject = () => {
  return (
    <div className={style.section_project_cont}>
      <div className={style.middle_project_wrapper}>
        {projectsList.map((item, index) => (
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
