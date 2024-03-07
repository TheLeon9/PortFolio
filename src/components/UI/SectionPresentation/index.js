import React, { useState, useEffect } from 'react';
import style from './index.module.scss';

const SectionPresentation = (props) => {
  const [text, setText] = useState('C');
  const [index, setIndex] = useState(0);
  const [animFinished, setAnimFinished] = useState(false);

  useEffect(() => {
    // Animation only if on the home page
    if (props.presentationText === 'Home') {
      const fullText = 'Creative Web De';
      const secondaryText = ['veloper', 'signer'];
      let currentIndex = 1;
      let writingInterval;
      let erasingInterval;
      let initialWritingInterval;
      const delay = 200;
      const delay2 = 400;

      // Launch the first animation
      //  Writting of fullText
      const initialWriteText = () => {
        setText(fullText.substring(0, currentIndex++));
        if (currentIndex > fullText.length) {
          clearInterval(initialWritingInterval);
          // Set to true to launch the secondaryText animation
          setAnimFinished(true);
        }
      };

      // Launch the second animation
      //  Writting of secondaryText
      const writeText = () => {
        writingInterval = setInterval(() => {
          setText(
            `${fullText}${secondaryText[index].substring(0, currentIndex++)}`
          );
          if (currentIndex > secondaryText[index].length) {
            clearInterval(writingInterval);
            setTimeout(eraseText, delay2);
          }
        }, delay);
      };

      // Launch the third animation
      //  Erasing of secondaryText
      const eraseText = () => {
        let reversedIndex = secondaryText[index].length;
        erasingInterval = setInterval(() => {
          setText(
            `${fullText}${secondaryText[index].substring(0, reversedIndex--)}`
          );
          if (reversedIndex < 0) {
            clearInterval(erasingInterval);
            setTimeout(() => {
              setIndex((prevIndex) => (prevIndex + 1) % secondaryText.length);
              currentIndex = 0;
              writeText();
            }, delay2);
          }
        }, delay);
      };

      // If fullText animation have finish, we only write the secondaryText
      if (!animFinished) {
        initialWritingInterval = setInterval(initialWriteText, delay);
      } else {
        writeText();
      }

      return () => {
        clearInterval(initialWritingInterval);
        clearInterval(writingInterval);
        clearInterval(erasingInterval);
      };
    } else {
      // No animation if not on the Home page
      setText(props.presentationText);
    }
  }, [props.presentationText, index, animFinished]);

  return (
    <section className={style.section_presentation_cont}>
      <h1 className={style.presentation_title}>{props.presentationTitle}</h1>
      <p className={`p_big`}>
        <span>{text}</span>
      </p>
    </section>
  );
};

export default SectionPresentation;
