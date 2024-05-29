import React from 'react';
import style from '@/styles/index/index.module.scss';

import SectionPresentation from '@/components/UI/SectionPresentation';

import SectionAbout from '@/components/sections/About';
import SectionContact from '@/components/sections/Contact';
import SectionProject from '@/components/sections/Projects';
import SectionSkill from '@/components/sections/Skills';

import { sectionsInformation } from '@/constants/constants';

const IndexPage = ({ activeSection }) => {
  return (
    <div className={`global_page_container ${style.global_page_container}`}>
      {/* Dispaly for each sections */}
      {sectionsInformation.map(
        (oneSection, index) =>
          activeSection === index.toString() && (
            <div key={index}>
              <SectionPresentation
                key={index}
                presentationTitle={oneSection.title}
                presentationTitleColored={oneSection.coloredTitle}
                presentationText={oneSection.text}
              />
              {index === 1 && <SectionAbout />}
              {index === 2 && <SectionContact />}
              {index === 3 && <SectionProject />}
              {index === 4 && <SectionSkill />}
            </div>
          )
      )}
    </div>
  );
};

export default IndexPage;
