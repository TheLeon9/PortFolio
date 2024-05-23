import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import style from './index.module.scss';

import Logo from 'p/img/logo/logo_fm_black.svg';

const NavBar = ({ setActiveSection, activeSection }) => {
  const imgWH = 20;

  const ActiveSectionSubstrac = () => {
    if (parseInt(activeSection) > 0) {
      setActiveSection(parseInt(activeSection) - 1);
    }
  };

  const ActiveSectionAdd = () => {
    if (activeSection < 4) {
      setActiveSection(parseInt(activeSection) + 1);
    }
  };

  return (
    <header className={style.header_cont}>
      {/* Button Substrac */}
      <button
        onClick={() => ActiveSectionSubstrac('')}
        className={style.change_active_section}
      >
        <Image src={Logo.src} alt="Logo Home" width={imgWH} height={imgWH} />
      </button>
      {/* Button Home */}
      <button
        onClick={() => setActiveSection('')}
        className={`${style.nav_bar_link} ${
          activeSection === '0'
            ? style.nav_bar_link_active
            : 'nav_bar_link_not_active'
        }`}
      >
        <Image src={Logo.src} alt="Logo Home" width={imgWH} height={imgWH} />
        <p className={style.nav_title_section}>
          <span>About</span>
          <span>About</span>
        </p>
      </button>
      {/* Button About */}
      {/* <button
          onClick={() => setActiveSection('About')}
          className={`${style.nav_bar_link} ${
            navBarOpenText ? style.navbar_open_text : style.navbar_close_text
          } ${activeSection === 'About' ? style.active : ''}`}
        >
          <p className={`p_medium p_bold`}>About</p>
          <p className={`p_medium p_bold`}>About</p>
        </button> */}
      {/* Button Contact */}
      {/* <button
          onClick={() => setActiveSection('Contact')}
          className={`${style.nav_bar_link} ${
            navBarOpenText ? style.navbar_open_text : style.navbar_close_text
          } ${activeSection === 'Contact' ? style.active : ''}`}
        >
          <p className={`p_medium p_bold`}>Contact</p>
          <p className={`p_medium p_bold`}>Contact</p>
        </button> */}
      {/* Button Projects */}
      {/* <button
          onClick={() => setActiveSection('Projects')}
          className={`${style.nav_bar_link} ${
            navBarOpenText ? style.navbar_open_text : style.navbar_close_text
          } ${activeSection === 'Projects' ? style.active : ''}`}
        >
          <p className={`p_medium p_bold`}>Projects</p>
          <p className={`p_medium p_bold`}>Projects</p>
        </button> */}
      {/* Button Skills */}
      {/* <button
          onClick={() => setActiveSection('Skills')}
          className={`${style.nav_bar_link} ${
            navBarOpenText ? style.navbar_open_text : style.navbar_close_text
          } ${activeSection === 'Skills' ? style.active : ''}`}
        >
          <p className={`p_medium p_bold`}>Skills</p>
          <p className={`p_medium p_bold`}>Skills</p>
        </button> */}
      {/* Button Add */}
      <button
        onClick={() => ActiveSectionAdd('')}
        className={style.change_active_section}
      >
        <Image src={Logo.src} alt="Logo Home" width={imgWH} height={imgWH} />
      </button>
    </header>
  );
};

export default NavBar;
