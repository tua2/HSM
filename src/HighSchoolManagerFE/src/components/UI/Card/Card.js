import React from 'react';
import styles from './Card.module.css';

const card = props => {
  return (
    <div style={props.style} className={styles.Card}>
      {props.children}
    </div>
  );
}

export default card;
