import React, { useEffect, useState } from 'react';
import style from '@/styles/index/index.module.scss';

import SectionPresentation from '@/components/UI/SectionPresentation';

const IndexPage = () => {
  const [activeSection, setActiveSection] = useState('0');

  useEffect(() => {

    // We get the active section
    const storedActiveSection = localStorage.getItem('activeSection');

    // We set the active section or we set it at empty
    setActiveSection(storedActiveSection || '0');

    // If we change the active section we update it
    const handleStorageChange = () => {
      const updatedActiveSection = localStorage.getItem('activeSection');
      setActiveSection(updatedActiveSection || '0');
    };

    window.addEventListener('storageChange', handleStorageChange);

    return () => {
      window.removeEventListener('storageChange', handleStorageChange);
    };
  }, []);

  // useEffect(() => {
  //   console.log(activeSection);
  //   console.log(typeof(activeSection));
  // }, [activeSection]);

  return (
    <div className={style.global_page_container}>
      {activeSection === '0' && (
        <SectionPresentation
          presentationTitle="MORACCHINI"
          presentationTitleColored="FLORIAN"
          presentationText="Home"
        />
      )}

      {activeSection === '1' && (
        <SectionPresentation
          presentationTitle="ABOUT"
          presentationTitleColored="ME"
          presentationText="Learn more about who I am and what I do"
        />
      )}

      {activeSection === '2' && (
        <SectionPresentation
          presentationTitle="CONTACT"
          presentationTitleColored="ME"
          presentationText="Find out how to get in touch with me"
        />
      )}

      {activeSection === '3' && (
        <SectionPresentation
          presentationTitle="MY"
          presentationTitleColored="PROJECTS"
          presentationText="Explore a showcase of my diverse projects"
        />
      )}

      {activeSection === '4' && (
        <SectionPresentation
          presentationTitle="MY"
          presentationTitleColored="SKILLS"
          presentationText="Discover the various skills and technologies I work with"
        />
      )}
    </div>
  );
};

export default IndexPage;
