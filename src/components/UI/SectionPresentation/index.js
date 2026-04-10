//=============================================================================
// SectionPresentation — Animated header for each section (title + subtext)
//
// Reusable header rendered at the bottom of every section. The Home section
// gets a special "Developer / Designer" swap animation; the other sections
// just show plain text.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// Animated "Imagine • Create • Inspire" sentence rendered below the title.
import Sentence from '@/components/UI/Sentence';

// CSS module containing the typography + Developer/Designer swap animation.
import style from './index.module.scss';

/**
 * SectionPresentation
 * Pure presentation component. The Home variant uses a hard-coded layout
 * with the special swap; every other variant just renders the prop text.
 *
 * @param {Object} props
 * @param {string} props.presentationTitle        - First half of the title.
 * @param {string} props.presentationTitleColored - Coloured (brand) suffix.
 * @param {string} props.presentationText         - Subtitle. "Home" triggers special variant.
 */
const SectionPresentation = (props) => {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.section_presentation_cont}>
      {/* Two-tone title: plain part + brand-coloured part. */}
      <h1 className={style.presentation_title}>
        {props.presentationTitle}&nbsp;
        <span className={style.presentation_title_colored}>
          {props.presentationTitleColored}
        </span>
      </h1>

      {/* Subtitle — Home gets the Developer/Designer swap, others get a
          plain text node. */}
      <p className={`${style.span_text_cont}`}>
        {props.presentationText === 'Home' ? (
          <>
            Creative&nbsp;Web&nbsp;
            <span className={style.span_animation_cont}>
              <span className={style.span_hook}>[</span>
              <span className={style.span_developer}>Developer</span>
              <span className={style.span_designer}>Designer</span>
              <span className={style.span_hook}>]</span>
            </span>
          </>
        ) : (
          <span>{props.presentationText}</span>
        )}
      </p>

      {/* Always show the animated sentence below the title. */}
      <Sentence white="false" />
    </div>
  );
};

export default SectionPresentation;
