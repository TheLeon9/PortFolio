import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import style from './index.module.scss';

import Logo from 'p/img/logo/logo_fm_black.svg';
import ChevronUp from 'p/img/chevron/chevron_up.svg';
import ChevronDown from 'p/img/chevron/chevron_down.svg';

const NavBar = ({ setActiveSection, activeSection }) => {
  const imgWH = 20;

  const ActiveSectionSubstrac = () => {
    if (parseInt(activeSection) > 0) {
      setActiveSection(parseInt(activeSection) - 1);
    }
  };

  const ActiveSectionAdd = () => {
    if (parseInt(activeSection) < 4) {
      setActiveSection(parseInt(activeSection) + 1);
    }
  };

  return (
    <header className={style.header_cont}>
      {/* Button Substrac */}
      <button
        onClick={() => ActiveSectionSubstrac()}
        className={style.change_active_section}
      >
        <Image
          src={ChevronUp.src}
          alt="Logo Home"
          width={imgWH}
          height={imgWH}
        />
      </button>
      {/* Button Home */}
      <button
        onClick={() => setActiveSection('0')}
        className={
          activeSection == '0'
            ? style.nav_bar_link_active
            : style.nav_bar_link_not_active
        }
      >
        <p className={style.nav_title_btn}>0{activeSection}</p>
        <p className={style.nav_title_section}>Home</p>
      </button>
      {/* Button About */}
      <button
        onClick={() => setActiveSection('1')}
        className={
          activeSection == '1'
            ? style.nav_bar_link_active
            : style.nav_bar_link_not_active
        }
      >
        <p className={style.nav_title_btn}>0{activeSection}</p>
        <p className={style.nav_title_section}>About</p>
      </button>
      {/* Button Contact */}
      <button
        onClick={() => setActiveSection('2')}
        className={
          activeSection == '2'
            ? style.nav_bar_link_active
            : style.nav_bar_link_not_active
        }
      >
        <p className={style.nav_title_btn}>0{activeSection}</p>
        <p className={style.nav_title_section}>Contact</p>
      </button>
      {/* Button Projects */}
      <button
        onClick={() => setActiveSection('3')}
        className={
          activeSection == '3'
            ? style.nav_bar_link_active
            : style.nav_bar_link_not_active
        }
      >
        <p className={style.nav_title_btn}>0{activeSection}</p>
        <p className={style.nav_title_section}>Projects</p>
      </button>
      {/* Button Skills */}
      <button
        onClick={() => setActiveSection('4')}
        className={
          activeSection == '4'
            ? style.nav_bar_link_active
            : style.nav_bar_link_not_active
        }
      >
        <p className={style.nav_title_btn}>0{activeSection}</p>
        <p className={style.nav_title_section}>Skills</p>
      </button>
      {/* Button Add */}
      <button
        onClick={() => ActiveSectionAdd()}
        className={style.change_active_section}
      >
        <Image
          src={ChevronDown.src}
          alt="Logo Home"
          width={imgWH}
          height={imgWH}
        />
      </button>
    </header>
  );
};

export default NavBar;
