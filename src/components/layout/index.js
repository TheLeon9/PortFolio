import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import style from './index.module.scss';

import NavBar from '@/components/partials/NavBar';
import ScrollBtn from '@/components/partials/ScrollBtn';
import ShareBtn from '@/components/partials/ShareBtn';
import Sentence from '@/components/partials/Sentence';

import LogoWhite from 'p/img/logo/logo_fm_white.svg';

const Layout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
    window.dispatchEvent(new Event('storageChange'));
  }, [activeSection]);

  const handleHomeClick = () => {
    setActiveSection('');
  };

  // 3D

  // PAGE LOADING
  
  return (
    <div className={style.global_cont}>
      {/* Corner Top Left */}
      <div className={style.home_btn_cont}>
        {/* Button Home */}
        <button onClick={handleHomeClick} className={style.home_btn}>
          <Image
            src={LogoWhite.src}
            alt="Logo FM"
            width={40}
            height={40}
            className={style.home_logo}
          />
        </button>
      </div>
      {/* Corner Top Right */}
      <ShareBtn />
      {/* Corner Bottom Right */}
      <ScrollBtn />
      {/* Corner Bottom Left */}
      <Sentence />
      {/* Navigation Bar */}
      <NavBar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      {children}
    </div>
  );
};

export default Layout;
