import React, {Component} from 'react';
import {Select, Table} from 'antd';
import styles from './MonthlyReport.module.css';

import Fetch from '../../../../common/commonFetch';

import LoadScreen from '../../../../components/UI/LoadScreen/LoadScreen';
import Button from '../../../../components/UI/Button/Button';

const {Option, OptGroup} = Select;

class MonthlyReport extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    callCreateReport: false,
    creatingReport: false,
    callChangeYear: false,

    filters: {
      month: 9,
      year: null,
      classID: null,
      gradeID: null,
    },

    classes: [],
    formattedClasses: [],
    grades: [],
    years: [],
    semesters: [],
    months: [
      {month: 9, label: 'September'},
      {month: 10, label: 'October'},
      {month: 11, label: 'November'},
      {month: 12, label: 'December'},
      {month: 2, label: 'February'},
      {month: 3, label: 'March'},
      {month: 4, label: 'April'},
      {month: 5, label: 'May'},
    ],

    report: [],

    tableColumns: [],
  }

  setupReportColumns() {
    let tableColumns = [];
    const leftColumns = [
      {
        title: 'Rank',
        dataIndex: 'rank',
        key: 'rank',
        //fixed: "left",
      },
      {
        title: 'Last Name',
        width: 200,
        key: 'lastName',
        render: (text, record, index) => record.student.lastName,
        //fixed: "left",
      },
      {
        title: 'First Name',
        width: 150,
        key: 'firstName',
        render: (text, record, index) => record.student.firstName,
        //fixed: "left",
      },
      {
        title: 'Class',
        key: 'class',
        render: (text, record, index) => record.student.class.name,
        //fixed: "left",
        sorter: (a,b) => a.student.class.name.localeCompare(b.student.class.name),
        sortDirections: ['ascend', 'descend'],
      },
    ];
    const rightColumns = [
      {
        title: 'Avg',
        key: 'avg',
        dataIndex: 'sumAverage',
        render: (text, record, index) => <b>{record.sumAverage}</b>,
        sorter: (a,b) => a.sumAverage - b.sumAverage,
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Performance',
        key: 'performance',
        dataIndex: 'performance',
        render: (text, record, index) => <b>{record.performance}</b>,
        sorter: (a,b) => a.performance.localeCompare(b.performance),
        sortDirections: ['ascend', 'descend'],
      },
      //{
        //title: 'Conduct',
        //key: 'conduct',
        //render: (text, record, index) => <b>A</b> //TODO (never): get Conduct
      //},
    ];
    for (let c of leftColumns)
      tableColumns.push(c);
    for (let s of this.state.subjects) {
      tableColumns.push({
        title: <div style={{width: '100px', height: '18px', overflow: 'hidden'}}>{s.name}</div>,
        width: 100,
        key: "subject"+s.subjectID,
        render: (text, record, index) => record.resultAvgs.filter(rA => rA.subject.subjectID === s.subjectID)[0].average,
        sorter: (a,b) =>
          a.resultAvgs.filter(rA => rA.subject.subjectID === s.subjectID)[0].average - b.resultAvgs.filter(rA => rA.subject.subjectID === s.subjectID)[0].average,
        sortDirections: ['ascend', 'descend'],
      });
    }
    for (let c of rightColumns)
      tableColumns.push(c);

    this.setState({tableColumns: tableColumns});
  }

  filterOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let _filters = {...this.state.filters};
    _filters[key] = value;
    if (_filters.gradeID !== this.state.filters.gradeID) {
      _filters.classID = null;
    }
    if (key === 'year') {
      this.setState({callChangeYear: true});
    }
    this.setState({filters: _filters});
    this.setState({callUpdate: true, updating: true});
  };

  setDefaultFilters() {
    let _filters = {...this.state.filters};
    _filters.year = this.state.years[this.state.years.length-1] ? this.state.years[this.state.years.length-1] : null;
    _filters.gradeID = this.state.grades[0] ? this.state.grades[0].gradeID : null;
    this.setState({filters: _filters});
  }

  async componentDidMount() {
    await Promise.all([
      Fetch.fetchGrades(this),
      Fetch.fetchSubjects(this),
      Fetch.fetchYears(this),
    ]);
    await Promise.all([
        Fetch.fetchClasses(this, ['gradeID', 'year']),
        Fetch.fetchSemesters(this, ['year']),
    ]);
    this.setDefaultFilters();
    this.setupReportColumns();
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await Promise.all([
        Fetch.fetchClasses(this, ['gradeID', 'year']),
        Fetch.fetchSemesters(this, ['year']),
      ]);
      if (this.state.callChangeYear) {
        this.setState({callChangeYear: false});
        let newFilters = {...this.state.filters};
        newFilters.classID = null;
        this.setState({filters: newFilters});
      }
      this.setState({updating: false});
    }
    if (this.state.callCreateReport) {
      this.setState({callCreateReport: false});
      await Fetch.fetchMonthlyReport(this, ['year', 'month', 'gradeID', 'classID']);
      this.setState({creatingReport: false});
    }
  }

  render() {
    return (
      this.state.loading ? <LoadScreen style={{height: 'calc(100vh - 350px)'}} /> : (
        <div className={[styles.MonthlyReport, styles.FadeWrapper].join(' ')}>
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
              <span>Month:</span>
              <Select
                className={styles.FilterSelect}
                value={this.state.filters.month}
                onChange={event => this.filterOnChangeHandler(event, 'month')}
              >
                {this.state.months.map(m => (
                  <Option value={m.month} key={m.month}>{m.label}</Option>
                ))}
              </Select>
            </div>
            <div>
              <span>Grade:</span>
              <Select
                className={styles.FilterSelect}
                value={this.state.filters.gradeID}
                onChange={event => this.filterOnChangeHandler(event, 'gradeID')}
              >
                <Option value={null} hidden>None</Option>
                {this.state.grades.map(g => (
                  <Option value={g.gradeID} key={g.gradeID}>{g.name}</Option>
                ))}
              </Select>
            </div>
            <div style={{marginRight: '32px'}}>
              <span>Class: </span>
              <Select
                className={styles.FilterSelect}
                placeholder="Select class..."
                value={this.state.filters.classID}
                onChange={event => this.filterOnChangeHandler(event, 'classID')}
                disabled={!this.state.filters.gradeID}
              >
                <Option value={null}>All</Option>
                {Object.keys(this.state.formattedClasses).reverse().map(year => (
                  <OptGroup key={year} value={"disabled"+year} title={year} disabled>
                    {this.state.formattedClasses[year].map(c => (
                      <Option key={c.classID} value={c.classID}>
                        {c.name}
                      </Option>
                    ))}
                  </OptGroup>
                ))}
              </Select>
            </div>
            <div>
              <Button
                color="primary"
                disabled={
                  this.state.creatingReport || this.state.updating ||
                  !(this.state.filters.year && this.state.filters.month && this.state.filters.gradeID)
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
                <div className={styles.FadeWrapper}>
                  <Table
                    columns={this.state.tableColumns}
                    dataSource={this.state.report}
                    scroll={{x: 176*(this.state.subjects.length)+250}}
                    size="small"
                    pagination={false}
                    bordered
                  />
                </div>
              }
            </div>
          </div>
        </div>
      )
    );
  }
}

export default MonthlyReport;
