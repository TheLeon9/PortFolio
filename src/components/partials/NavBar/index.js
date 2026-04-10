//=============================================================================
// NavBar — Vertical navigation dots with up/down chevrons
//
// One dot per section, plus chevron buttons to step through sections one by
// one. The active section is highlighted via two distinct CSS classes
// (`nav_bar_link_active` / `nav_bar_link_not_active`).
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// Next.js optimised image component for the chevron SVGs.
import Image from 'next/image';

// Theme context exposes the active section + the programmatic scroll helper.
import { useTheme } from '@/context/ThemeContext.js';

// Section list (id, range) and shared image size constant.
import { sections, imgWH } from '@/constants';

// Chevron icons served from /public.
import ChevronUp from 'p/img/chevron/chevron_up.svg';
import ChevronDown from 'p/img/chevron/chevron_down.svg';

// CSS module for the dot layout, hover states and active/inactive variants.
import style from './index.module.scss';

/**
 * NavBar
 * Stateless overlay that reads `activeSection` and triggers
 * `scrollToSection` on every click.
 */
const NavBar = () => {
  //-- State / Refs -----------------------------------------------------------
  const { activeSection, scrollToSection } = useTheme();

  //-- Render -----------------------------------------------------------------
  return (
    <header
      className={style.header_cont}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Step backwards (previous section). */}
      <button
        onClick={() => scrollToSection(activeSection - 1)}
        className={`${style.change_active_section} hover_target_small`}
        aria-label="Previous section"
      >
        <Image src={ChevronUp} alt="Chevron Up" width={imgWH} height={imgWH} />
      </button>

      {/* One button per section. The active one is enlarged via CSS. */}
      {sections.map((section, index) => (
        <button
          key={index}
          onClick={() => scrollToSection(index)}
          // Active and inactive variants share the same base styles but
          // diverge on size and hover behaviour.
          className={`${
            activeSection === index
              ? `${style.nav_bar_link_active} hover_target_big`
              : `${style.nav_bar_link_not_active} hover_target_small`
          }`}
          aria-current={activeSection === index ? 'true' : undefined}
        >
          <p className={style.nav_title_btn}>0{index}</p>
          <p className={style.nav_title_section}>{section.id}</p>
        </button>
      ))}

      {/* Step forwards (next section). */}
      <button
        onClick={() => scrollToSection(activeSection + 1)}
        className={`${style.change_active_section} hover_target_small`}
        aria-label="Next section"
      >
        <Image
          src={ChevronDown}
          alt="Chevron Down"
          width={imgWH}
          height={imgWH}
        />
      </button>
    </header>
  );
};

export default NavBar;
