import React, {Component, Fragment} from 'react';
import {Select, Table} from 'antd';
import styles from './PerformanceReport.module.css';

import Fetch from '../../../../common/commonFetch';

import LoadScreen from '../../../../components/UI/LoadScreen/LoadScreen';
import Button from '../../../../components/UI/Button/Button';

const {Option} = Select;

class PerformanceReport extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    callCreateReport: false,
    creatingReport: false,
    callChangeYear: false,

    filters: {
      semesterID: null,
      year: null,
    },

    classes: [],
    formattedClasses: [],
    grades: [],
    years: [],
    semesters: [],
    performances: ['A', 'B', 'C', 'D', 'F'],

    report: [],

    tableColumns: [],
  }

  setupReportColumns() {
    let tableColumns = [];
    const leftColumns = [
      {
        title: 'Class',
        key: 'class',
        render: (text, record, index) => record.aClass.name,
        sorter: (a,b) => a.aClass.name.localeCompare(b.aClass.name),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Size',
        dataIndex: 'classSize',
        key: 'classSize',
      },
    ];
    for (let c of leftColumns)
      tableColumns.push(c);
    for (let _perf of this.state.performances) {
      tableColumns.push({
        title: `%${_perf}`,
        key: _perf,
        render: (text, record, index) => `${record.percentages.filter(p => p.performance === _perf)[0].percent*100}%`,
        sorter: (a,b) =>
          a.percentages.filter(p => p.performance === _perf)[0].percent - b.percentages.filter(p => p.performance === _perf)[0].percent,
        sortDirections: ['ascend', 'descend'],
      });
    }

    this.setState({tableColumns: tableColumns});
  }

  filterOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let _filters = {...this.state.filters};
    _filters[key] = value;
    if (key === 'year') {
      this.setState({callChangeYear: true});
    }
    this.setState({filters: _filters});
    this.setState({callUpdate: true, updating: true});
  };

  setDefaultFilters() {
    let _filters = {...this.state.filters};
    _filters.year = this.state.years[this.state.years.length-1] || null;
    _filters.semesterID = this.state.semesters[0] ? this.state.semesters[0].semesterID : null;
    this.setState({filters: _filters});
  }

  async componentDidMount() {
    await Promise.all([
      //Fetch.fetchClasses(this, ['gradeID']),
      Fetch.fetchGrades(this),
      //Fetch.fetchSubjects(this),
      Fetch.fetchYears(this),
    ]);
    await Fetch.fetchSemesters(this, ['year']);
    this.setDefaultFilters();
    this.setupReportColumns();
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await Promise.all([
        //Fetch.fetchClasses(this, ['gradeID']),
        Fetch.fetchSemesters(this, ['year']),
      ]);
      if (this.state.callChangeYear) {
        this.setState({callChangeYear: false});
        let newFilters = {...this.state.filters};
        newFilters.semesterID = this.state.semesters[0].semesterID;
        this.setState({filters: newFilters});
      }
      this.setState({updating: false});
    }
    if (this.state.callCreateReport) {
      this.setState({callCreateReport: false});
      await Fetch.fetchPerformanceReport(this, ['semesterID']);
      this.setState({creatingReport: false});
    }
  }

  render() {
    return (
      this.state.loading ? <LoadScreen style={{height: 'calc(100vh - 350px)'}} /> : (
        <div className={[styles.PerformanceReport, styles.FadeWrapper].join(' ')}>
          <div className={styles.FilterWrapper}>
            <div>
              <span>Year: </span>
              <Select
                className={styles.FilterSelect}
                //style={{marginBottom: '16px'}}
                placeholder="Select year..."
                value={this.state.filters.year}
                onChange={event => this.filterOnChangeHandler(event, 'year')}
                //disabled={this.state.updating}
              >
                <Option value={null} hidden>None</Option>
                {this.state.years.map(y => {
                  return (
                    <Option key={y} value={y}>
                      {`${y}-${y-1+2}`}
                    </Option>
                  );
                })}
              </Select>
            </div>
            <div>
              <span>Semester:</span>
              <Select
                className={styles.FilterSelect}
                value={this.state.filters.semesterID}
                onChange={event => this.filterOnChangeHandler(event, 'semesterID')}
              >
                <Option value={null} hidden>None</Option>
                {this.state.semesters.map(s => (
                  <Option value={s.semesterID} key={s.semesterID}>{s.label}</Option>
                ))}
              </Select>
            </div>
            <div>
              <Button
                color="primary"
                disabled={
                  this.state.creatingReport || this.state.updating ||
                  !(this.state.filters.year && this.state.filters.semesterID)
                }
                style={{
                  height: '32px',
                  marginBottom: '32px',
                  padding: '0rem 0.6rem',
                }}
                clicked={() => {this.setState({callCreateReport: true, creatingReport: true})}}
              >
                Create
              </Button>
            </div>
          </div>
          <div className={styles.TableWrapper}>
            <div style={{
              height: 'calc(100vh - 414px)',
              border: 'thin solid #e8e8e8',
              borderRadius: '4px',
              overflow: 'auto',
            }}>
              {this.state.creatingReport ? <LoadScreen /> :
                <div className={styles.FadeWrapper} style={{padding: '8px'}}>
                  {this.state.grades.map(_grade => (
                    <Fragment key={"table"+_grade.gradeID}>
                      <h2>Grade {_grade.name}</h2>
                      <Table
                        columns={this.state.tableColumns}
                        style={{marginBottom: '32px'}}
                        dataSource={this.state.report.filter(r => r.aClass.gradeID === _grade.gradeID)}
                        size="small"
                        pagination={false}
                        bordered
                      />
                    </Fragment>
                  ))}
                </div>
              }
            </div>
          </div>
        </div>
      )
    );
  }
}

export default PerformanceReport;
