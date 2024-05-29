import React from 'react';
import style from '@/styles/index/index.module.scss';

import SectionPresentation from '@/components/UI/SectionPresentation';

import { sectionsInformation } from '@/constants/constants';

const IndexPage = ({ activeSection }) => {
  return (
    <div className={`global_page_container ${style.global_page_container}`}>
      {/* Dispaly for each sections */}
      {sectionsInformation.map(
        (oneSection, index) =>
          activeSection === index.toString() && (
            <SectionPresentation
              key={index}
              presentationTitle={oneSection.title}
              presentationTitleColored={oneSection.coloredTitle}
              presentationText={oneSection.text}
            />
          )
      )}
    </div>
  );
};

export default IndexPage;
