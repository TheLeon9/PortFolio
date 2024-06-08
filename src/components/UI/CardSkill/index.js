import React from 'react';
import style from './index.module.scss';

const CardSkill = ({ cardTitle }) => {
  return (
    <div className={style.card_skill}>
      <p className={style.card_title}>{cardTitle}</p>
    </div>
  );
};

export default CardSkill;
