import React from 'react';
import styles from './InvalidBox.module.css';

const invalidBox = props => {
  return (
    <div
      style={{
        width: props.width, 
        margin: props.margin,
        display: props.children ? 'inline-block' : 'block',
        height: props.children ? '21px' : '0',
      }} 
      className={styles.InvalidBox}
    >
      {props.children}
    </div>
  );
}

export default invalidBox;
