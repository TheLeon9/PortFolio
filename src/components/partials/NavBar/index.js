import React from 'react';
import Image from 'next/image';
import style from './index.module.scss';

import ChevronUp from 'p/img/chevron/chevron_up.svg';
import ChevronDown from 'p/img/chevron/chevron_down.svg';

import { sections, imgWH } from '@/constants';
import { useTheme } from '@/context/ThemeContext.js';

const NavBar = () => {
  const { activeSection, scrollToSection } = useTheme();

  return (
    <header className={style.header_cont}>
      {/* BTN for section UP */}
      <button
        onClick={() => scrollToSection(activeSection - 1)}
        className={`${style.change_active_section} hover_target_small`}
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
        onClick={() => scrollToSection(index)}
        className={`${
          activeSection === index
          ? `${style.nav_bar_link_active} hover_target_big`
          : `${style.nav_bar_link_not_active} hover_target_small`
        }`}
        >
          <p className={style.nav_title_btn}>0{index}</p>
          <p className={style.nav_title_section}>{section.id}</p>
        </button>
      ))}

      {/* BTN for section DOWN */}
      <button
        onClick={() => scrollToSection(activeSection + 1)}
        className={`${style.change_active_section} hover_target_small`}
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
