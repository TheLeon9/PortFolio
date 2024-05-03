import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import style from './index.module.scss';

import Logo from 'p/img/logo/logo_fm_black.svg';

const NavBar = ({ setActiveSection, activeSection }) => {
  const [navBarOpen, setNavBarOpen] = useState(false);
  const [navBarOpenText, setNavBarOpenText] = useState(true);

  const delayOpen = 280;
  const delayClose = 100;

  // A little timer for the text to appear after the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavBarOpenText(false);

      return () => clearTimeout(timer);
    }, delayOpen);

    return () => clearTimeout(timer);
  }, []);

  const handleHeaderClick = () => {
    // If the navbar is open (true), the text disappears first, then it closes
    if (!navBarOpen) {
      setNavBarOpenText(!navBarOpenText);

      setTimeout(() => {
        setNavBarOpen(!navBarOpen);
      }, delayClose);
    }
    // If the navbar is not open (false), the text appears after the navbar opens
    else {
      setNavBarOpen(!navBarOpen);

      setTimeout(() => {
        setNavBarOpenText(!navBarOpenText);
      }, delayOpen);
    }
  };

  return (
    <header className={style.header_cont}>
      <div
        className={`${style.header} ${
          navBarOpen ? style.navbar_open : style.navbar_close
        }`}
      >
        {/* Button About */}
        <button
          onClick={() => setActiveSection('About')}
          className={`${style.nav_bar_link} ${
            navBarOpenText ? style.navbar_open_text : style.navbar_close_text
          } ${activeSection === 'About' ? style.active : ''}`}
        >
          <p className={`p_medium p_bold`}>About</p>
          <p className={`p_medium p_bold`}>About</p>
        </button>
        {/* Button Contact */}
        <button
          onClick={() => setActiveSection('Contact')}
          className={`${style.nav_bar_link} ${
            navBarOpenText ? style.navbar_open_text : style.navbar_close_text
          } ${activeSection === 'Contact' ? style.active : ''}`}
        >
          <p className={`p_medium p_bold`}>Contact</p>
          <p className={`p_medium p_bold`}>Contact</p>
        </button>
        <div className={style.header_center}>
          {/* Light Mauve Dot Around Button */}
          <div className={style.dot_top_left}></div>
          <div className={style.dot_top_right}></div>
          <div className={style.dot_bottom_right}></div>
          <div className={style.dot_bottom_left}></div>
          {/* Button Nav Bar */}
          <button onClick={handleHeaderClick} className={style.btn_logo}>
            <Image
              src={Logo.src}
              alt="Logo FM"
              width={60}
              height={60}
              className={style.navbar_logo}
            />
          </button>
        </div>
        {/* Button Projects */}
        <button
          onClick={() => setActiveSection('Projects')}
          className={`${style.nav_bar_link} ${
            navBarOpenText ? style.navbar_open_text : style.navbar_close_text
          } ${activeSection === 'Projects' ? style.active : ''}`}
        >
          <p className={`p_medium p_bold`}>Projects</p>
          <p className={`p_medium p_bold`}>Projects</p>
        </button>
        {/* Button Skills */}
        <button
          onClick={() => setActiveSection('Skills')}
          className={`${style.nav_bar_link} ${
            navBarOpenText ? style.navbar_open_text : style.navbar_close_text
          } ${activeSection === 'Skills' ? style.active : ''}`}
        >
          <p className={`p_medium p_bold`}>Skills</p>
          <p className={`p_medium p_bold`}>Skills</p>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
