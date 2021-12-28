import React, {Component} from 'react';
import {Select} from 'antd';
import styles from './CreateReport.module.css';

import MonthlyReport from './MonthlyReport/MonthlyReport';
import SemesterReport from './SemesterReport/SemesterReport';
import PerformanceReport from './PerformanceReport/PerformanceReport';

import Card from '../../../components/UI/Card/Card';

const {Option} = Select;

class CreateReport extends Component {
  state = {
    callUpdate: false,
    updating: false,

    reportTypeKey: null,
  }

  reportTypes = [
    {key: 'monthly', name: 'Monthly Summary'},
    {key: 'semester', name: 'Semester Summary'},
    {key: 'performance', name: 'Performance of Class Summary'},
  ]

  reportTypeOnChangeHandler = (event) => {
    const value = event;
    this.setState({reportTypeKey: value});
    this.setState({callUpdate: true, updating: true});
  }

  render() {
    return (
      <div className={[styles.CreateReport, styles.FadeWrapper].join(' ')}>
        <h1>Create Report</h1>
        <p>Create new student report</p>
        <div className={styles.FilterWrapper}>
          <div>
            <span>Type:</span>
            <Select
              className={styles.FilterSelect}
              style={{width: '300px'}}
              value={this.state.reportTypeKey}
              onChange={event => this.reportTypeOnChangeHandler(event)}
            >
              <Option value={null} hidden>None</Option>
              {this.reportTypes.map(rT => (
                <Option value={rT.key} key={rT.key}>{rT.name}</Option>
              ))}
            </Select>
          </div>
        </div>
        <Card style={{height: 'calc(100vh - 284px)', flexDirection: 'column', overflow: 'hidden'}} >
          {this.state.reportTypeKey === 'monthly' ? <div><MonthlyReport /></div> : null}
          {this.state.reportTypeKey === 'semester' ? <div><SemesterReport /></div> : null}
          {this.state.reportTypeKey === 'performance' ? <div><PerformanceReport /></div> : null}
        </Card>
      </div>
    );
  }
}

export default CreateReport;
