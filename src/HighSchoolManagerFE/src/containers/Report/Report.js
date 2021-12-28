import React, {Component} from 'react';
import styles from './Report.module.css';

class Report extends Component {
  render() {
    return (
      <div className={[styles.Report, styles.FadeWrapper].join(' ')}>
        <h1>Reports</h1>
        <p>View created reports</p>
      </div>
    );
  }
}

export default Report;
