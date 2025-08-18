import React from 'react';
import style from './index.module.scss';

import CardProject from '@/components/UI/CardProject';
import { useConstants } from '@/context/ConstantsContext';

const SectionProject = () => {
  
  const { projects } = useConstants();

  return (
    <div className={style.section_project_cont}>
      <div className={style.middle_project_wrapper}>
        {projects
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
