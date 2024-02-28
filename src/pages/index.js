import React, { useEffect } from 'react';
import style from '@/styles/index/index.module.scss';

const IndexPage = ({ activeSection }) => {
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
