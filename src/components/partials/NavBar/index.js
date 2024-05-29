import React from 'react';
import Image from 'next/image';

import style from './index.module.scss';

import ChevronUp from 'p/img/chevron/chevron_up.svg';
import ChevronDown from 'p/img/chevron/chevron_down.svg';

import { sections, imgWH } from '@/constants/constants';

const NavBar = ({ activeSection, changeSection }) => {

  return (
    <header className={style.header_cont}>
      {/* BTN for section UP */}
      <button
        onClick={() => changeSection(parseInt(activeSection) - 1)}
        className={style.change_active_section}
      >
        <Image
          src={ChevronUp.src}
          alt="Chevron Up"
          width={imgWH}
          height={imgWH}
        />
      </button>

      {/* BTN for each sections */}
      {sections.map((section, index) => (
        <button
          key={index}
          onClick={() => changeSection(index)}
          className={
            activeSection === index.toString()
              ? style.nav_bar_link_active
              : style.nav_bar_link_not_active
          }
        >
          <p className={style.nav_title_btn}>0{index}</p>
          <p className={style.nav_title_section}>{section}</p>
        </button>
      ))}

      {/* BTN for section DOWN */}
      <button
        onClick={() => changeSection(parseInt(activeSection) + 1)}
        className={style.change_active_section}
      >
        <Image
          src={ChevronDown.src}
          alt="Chevron Down"
          width={imgWH}
          height={imgWH}
        />
      </button>
    </header>
  );
};

export default NavBar;
