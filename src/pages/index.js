import React, { useEffect, useState } from 'react';
import style from '@/styles/index/index.module.scss';

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

  useEffect(() => {
    console.log(activeSection);
  }, [activeSection]);

  return (
    <div>
      {activeSection === '' && (
        <section>
          <p>Home</p>
        </section>
      )}

      {activeSection === 'About' && (
        <section>
          <p>About</p>
        </section>
      )}

      {activeSection === 'Contact' && (
        <section>
          <p>Contact</p>
        </section>
      )}

      {activeSection === 'Projects' && (
        <section>
          <p>Projets</p>
        </section>
      )}

      {activeSection === 'Skills' && (
        <section>
          <p>Skills</p>
        </section>
      )}
    </div>
  );
};

export default IndexPage;
