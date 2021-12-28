import React, {Component} from 'react';
import styles from './Result.module.css';

class Result extends Component {
  render() {
    return (
      <div className={[styles.Result, styles.FadeWrapper].join(' ')}>
        <h1>Results</h1>
        <p>View and manage students results</p>
      </div>
    );
  }
}

export default Result;
