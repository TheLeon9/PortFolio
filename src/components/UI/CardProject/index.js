import React from 'react';
import style from './index.module.scss';

const CardProject = ({ cardTitle, cardNumber, cardDescription }) => {
  return (
    <div className={style.card_project}>
      <div className={style.card_content}>
        <p className={style.card_project_description}>{cardDescription}</p>
      </div>
      <p className={style.card_project_number}>{cardNumber}</p>
      <p className={style.card_project_title}>{cardTitle}</p>
    </div>
  );
};

export default CardProject;
