import React, {Component, Fragment} from 'react';
import {Input, Table, message} from 'antd';
import styles from './SchoolYear.module.css';

import Request from '../../../common/commonRequest';
import Button from '../../../components/UI/Button/Button';
import LoadScreen from '../../../components/UI/LoadScreen/LoadScreen';
import Card from '../../../components/UI/Card/Card';

class SchoolYear extends Component {
  state = {
    loading: true,
    updating: false,
    callUpdate: false,
    years: [],
    submittingForm: false,

    newYear: null,
  }

  tableColumns = [
    {
      title: 'School year',
      key: 'year',
      render: (text, record, index) => `${record.year}-${record.year-1+2}`,
      sorter: (a,b) => a.year - b.year,
      sortDirections: ['ascend', 'descend'],
    },
  ];

  yearOnChangeHandler = (event) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    this.setState({newYear: value});
  }

  submitFormHandler = async () => {
    this.setState({submittingForm: true});
    await Request.post('/Semester/NewYear?year='+this.state.newYear, null, 'cred',
      () => {
        this.setState({callUpdate: true, updating: true});
        message.success('Creating new year successfully');
      },
      error => {
        console.log(error.response);
        message.error('Invalid year');
      });
    this.setState({submittingForm: false});
  }

  async fetchYears() {
    let newYears = [];
    await Request.get('/Semester/Get', 'cred', response => {
      newYears = response.data.map(s => s.year);
      newYears = newYears.filter((y, index, self) => self.indexOf(y) === index);
      newYears = newYears.map(y => {return {year: y, key: y}})
    });
    this.setState({years: newYears});
  }

  async componentDidMount() {
    await Promise.all([this.fetchYears()]);
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await Promise.all([this.fetchYears()]);
      this.setState({updating: false});
    }
  }

  render() {
    return (
      <Fragment>
        {this.state.loading ? <LoadScreen style={{position: 'fixed', top: '64px', left: '225px'}} /> : (
          <div className={[styles.SchoolYear, styles.FadeWrapper].join(' ')}>
            <h1>School Years</h1>
            <p>Manage school years</p>
            <Card style={{height: 'calc(100vh - 232px)', flexDirection: 'column'}} >
              <div style={{width: 'calc(50vw - 210px)'}}>
                <div className={styles.FilterWrapper}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span>New School Year:</span>
                    <Input
                      className={styles.FilterInput}
                      value={this.state.newYear}
                      onChange={this.yearOnChangeHandler}
                    />
                  </div>
                  <div>
                    <Button
                      color="primary"
                      icon="fa-plus"
                      style={{
                        height: '32px',
                        marginBottom: '32px',
                        padding: '0.1rem calc(0.6rem - 10px) 0rem 0.6rem',
                      }}
                      clicked={this.submitFormHandler}
                    >
                    </Button>
                  </div>
                </div>
                <div style={{
                  height: 'calc(100vh - 529px)',
                  marginTop: '16px',
                  border: 'thin solid #e8e8e8',
                  borderRadius: '4px'
                }}>
                  {this.state.updating ? <LoadScreen /> :
                    <Table
                      dataSource={this.state.years}
                      columns={this.tableColumns}
                      scroll={{x: 700, y: 326}}
                      size="small"
                      pagination={false}
                    />
                  }
                </div>
              </div>
            </Card>
          </div>
        )}
      </Fragment>
    );
  }
}

export default SchoolYear
