import React, { useEffect, useState } from 'react';
import style from '@/styles/index/index.module.scss';

import SectionPresentation from '@/components/UI/SectionPresentation';

const IndexPage = () => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const storedActiveSection = localStorage.getItem('activeSection');
    setActiveSection(storedActiveSection || '');

    const handleStorageChange = () => {
      const updatedActiveSection = localStorage.getItem('activeSection');
      setActiveSection(updatedActiveSection || '');
    };

    window.addEventListener('storageChange', handleStorageChange);

    return () => {
      window.removeEventListener('storageChange', handleStorageChange);
    };
  }, []);

  // useEffect(() => {
  //   console.log(activeSection);
  // }, [activeSection]);

  return (
    <div className={style.global_page_container}>
      {activeSection === '' && (
        <SectionPresentation
          presentationTitle="MORACCHINI"
          presentationTitleColored="FLORIAN"
          presentationText="Home"
        />
      )}

      {activeSection === 'About' && (
        <SectionPresentation
          presentationTitle="ABOUT"
          presentationTitleColored="ME"
          presentationText="Learn more about who I am and what I do"
        />
      )}

      {activeSection === 'Contact' && (
        <SectionPresentation
          presentationTitle="CONTACT"
          presentationTitleColored="ME"
          presentationText="Find out how to get in touch with me"
        />
      )}

      {activeSection === 'Projects' && (
        <SectionPresentation
          presentationTitle="MY"
          presentationTitleColored="PROJECTS"
          presentationText="Explore a showcase of my diverse projects"
        />
      )}

      {activeSection === 'Skills' && (
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
