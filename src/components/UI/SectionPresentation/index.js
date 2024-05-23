import React from 'react';
import style from './index.module.scss';
import Sentence from '@/components/UI/Sentence';

const SectionPresentation = (props) => {
  return (
    <section className={style.section_presentation_cont}>
      <h1 className={style.presentation_title}>
        {props.presentationTitle}&nbsp;
        <span className={style.presentation_title_colored}>
          {props.presentationTitleColored}
        </span>
      </h1>
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
      <Sentence white="false" />
    </section>
  );
};

export default SectionPresentation;
