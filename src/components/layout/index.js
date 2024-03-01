import React, { useState, useEffect } from 'react';
import style from './index.module.scss';

import NavBar from '@/components/partials/NavBar';
import ScrollBtn from '@/components/partials/ScrollBtn';
import ShareBtn from '@/components/partials/ShareBtn';
import Sentence from '@/components/partials/Sentence';

const Layout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
    window.dispatchEvent(new Event('storageChange'));
  }, [activeSection]);

  return (
    <div className={style.global_cont}>
      <NavBar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <ScrollBtn />
      <ShareBtn />
      <Sentence />
      {children}
    </div>
  );
};

export default Layout;
