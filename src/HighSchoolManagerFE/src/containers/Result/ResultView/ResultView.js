import React, {Component, Fragment} from 'react';
import styles from './ResultView.module.css';
import {Table, Select} from 'antd';

import StudentPickerContext from '../../../context/studentpicker-context';
import Request from '../../../common/commonRequest'
import Card from '../../../components/UI/Card/Card';
import LoadScreen from '../../../components/UI/LoadScreen/LoadScreen';
import Button from '../../../components/UI/Button/Button';
import StudentPickerModal from '../../../components/Partial/StudentPicker/StudentPicker';

const {Option} = Select;

class ResultView extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,

    isPickingStudent: false,
    studentID: null,
    student: null,
    year: null,

    subjects: [],

    tableColumns: [
      {
        title: 'Subject',
        width: 232,
        fixed: 'left',
        key: 'name',
      },
      {title: 'September', children: [{title: "15'", key: "m1t1", month: 9, type: 1}, {title: "45'", key: "m1t2", month: 9, type: 2}, {title: "Avg", month: 9, key: "m1avg"}]},
      {title: 'October', children: [{title: "15'", key: "m2t1", month: 10, type: 1}, {title: "45'", key: "m2t2", month: 10, type: 2}, {title: "Avg", month: 10, key: "m2avg"}]},
      {title: 'November', children: [{title: "15'", key: "m3t1", month: 11, type: 1}, {title: "45'", key: "m3t2", month: 11, type: 2}, {title: "Avg", month: 11, key: "m3avg"}]},
      {title: 'December', children: [{title: "15'", key: "m4t1", month: 12, type: 1}, {title: "45'", key: "m4t2", month: 12, type: 2}, {title: "Avg", month: 12, key: "m4avg"}]},
      {title: 'Semester I', children: [{title: "Exam", key: "s1", month: 12, type: 3}, {title: "S.Avg", key: "s1avg", semesterIndex: 1}]},
      {title: 'February', children: [{title: "15'", key: "m5t1", month: 2, type: 1}, {title: "45'", key: "m5t2", month: 2, type: 2}, {title: "Avg", month: 2, key: "m5avg"}]},
      {title: 'March', children: [{title: "15'", key: "m6t1", month: 3, type: 1}, {title: "45'", key: "m6t2", month: 3, type: 2}, {title: "Avg", month: 3, key: "m6avg"}]},
      {title: 'April', children: [{title: "15'", key: "m7t1", month: 4, type: 1}, {title: "45'", key: "m7t2", month: 4, type: 2}, {title: "Avg", month: 4, key: "m7avg"}]},
      {title: 'May', children: [{title: "15'", key: "m8t1", month: 5, type: 1}, {title: "45'", key: "m8t2", month: 5, type: 2}, {title: "Avg", month: 5, key: "m8avg"}]},
      {title: 'Semester II', children: [{title: "Exam", key: "s2", month: 5, type: 3}, {title: "S.Avg", key: "s2avg", semesterIndex: 2}]},
      {title: 'Sum.', children: [{title: "S.Avg", key: "s3avg", semesterIndex: 3}]},
    ],
  }

  filterOnChangeHandler = (event, key) => {
    const value = event;
    this.setState({[key]: value, callUpdate: true, updating: true});
  }

  setupMarkColumns() {
    let markColumns = JSON.parse(JSON.stringify(this.state.tableColumns));
    markColumns.forEach(c => {
      if (c.title === 'Subject') {
        c.render = (text, record, index) => (<span>{record.name}</span>);
        return;
      }
      c.children.forEach(cChild => {
        cChild.width = 70;
        cChild.render = (text, record, index) => {
          let _mark = record.resultDetails.filter(rD => rD.month === cChild.month && rD.resultTypeID === cChild.type)[0];
          const newMark = _mark ? _mark.mark : null;
          const newMonth = cChild.month;
          if (cChild.title === "Avg") {
            let avg = null;
            const resultAvg = record.resultAvgs.filter(rA => rA.month === newMonth)[0];
            if (resultAvg)
              avg = resultAvg.average;
            return <div style={{textAlign: "center"}}><b>{avg}</b></div>
          }
          if (cChild.title === "S.Avg") {
            const newSemesterIndex = cChild.semesterIndex;
            let avg = null;
            const resultYearAvg = record.resultYearAvgs.filter(rYA => rYA.semesterIndex === newSemesterIndex)[0];
            if (resultYearAvg)
              avg = resultYearAvg.average;
            return <div style={{textAlign: "center"}}><b>{avg}</b></div>
          }
          return <div style={{textAlign: "center"}}>{newMark}</div>
        };
      });
    });
    this.setState({tableColumns: markColumns});
  }

  async fetchStudent(_studentID) {
    let studentPromise = await Request.get('/Student/Get?studentID='+_studentID, 'cred');
    let student = studentPromise.data;
    return student;
  }

  async fetchSemesters() {
    let _semesters = [];
    let semestersPromise = await Request.get('/Semester/Get', 'cred');
    _semesters = semestersPromise.data;
    this.setState({semesters: _semesters});
    if (_semesters.length > 0)
      this.setState({year: _semesters.reverse()[0].year});
  }

  async getSubjectMonthlyAverages(subjectID) {
    let resultAvgs = [];
    let subjectMonthlyAveragePromise = await Request
      .get(`/Result/SubjectMonthlyAverages?studentID=${this.state.studentID}&year=${this.state.year}&subjectID=${subjectID}`, 'cred');
    resultAvgs = subjectMonthlyAveragePromise.data.averages;
    return resultAvgs;
  }

  async getSubjectYearlyAverages(subjectID) {
    let resultYearAvgs = [];
    let subjectYearlyAveragePromise = await Request
      .get(`/Result/SubjectYearlyAverages?studentID=${this.state.studentID}&year=${this.state.year}&subjectID=${subjectID}`, 'cred');
    resultYearAvgs = subjectYearlyAveragePromise.data;
    return resultYearAvgs;
  }

  async fetchSubjectResults() {
    let newSubjects = [];
    if (this.state.studentID && this.state.year) {
      let newSubjectsPromise = await Request.get('/Subject/Get', 'cred');
      for (const _subject of newSubjectsPromise.data) {
        let newSubject = {};
        newSubject.key = _subject.subjectID;
        newSubject.name = _subject.name;
        newSubject.resultDetails = [];
        // resultDetails - Subject ResultDetails of Semesters
        for (let sem of this.state.semesters.filter(s => s.year === this.state.year)) {
          let semesterResultDetailsPromise = await Request
            .get(`/Result/Get?studentID=${this.state.studentID}&semesterID=${sem.semesterID}&subjectID=${newSubject.key}`, 'cred');
          const _resultDetails = semesterResultDetailsPromise.data[0] ? semesterResultDetailsPromise.data[0].resultDetails : null;
          if (_resultDetails) {
            for (let rD of _resultDetails) {
              newSubject.resultDetails.push(rD);
            };
          }
        };
        // resultAvgs - SubjectMonthlyAverage
        newSubject.resultAvgs = await this.getSubjectMonthlyAverages(newSubject.key);
        newSubject.resultYearAvgs = await this.getSubjectYearlyAverages(newSubject.key);
        newSubjects.push(newSubject);
      };
    }
    this.setState({subjects: newSubjects});
  }

  async componentDidMount() {
    this.setupMarkColumns();
    await Promise.all([this.fetchSemesters()]);
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await this.fetchSubjectResults();
      this.setState({updating: false});
    }
  }

  render() {
    return (
      <Fragment>
        <StudentPickerContext.Provider value={{
          isPicking: this.state.isPickingStudent,
          studentID: this.state.studentID,
          changeStudent: async (studentID) => {
            let _student = await this.fetchStudent(studentID);
            this.setState({
              studentID: studentID,
              student: _student,
              callUpdate: true, updating: true
            });
          },
          stopPicking: () => {this.setState({isPickingStudent: false})},
        }}>
          {!this.state.isPickingStudent ? null :
            <StudentPickerModal defaultStudent={this.state.studentID} />
          }
        </StudentPickerContext.Provider>
        {this.state.loading ? <LoadScreen /> : (
          <div className={[styles.ResultView, styles.FadeWrapper].join(' ')}>
            <h1>View Results</h1>
            <p>View students results</p>
            <Card style={{height: 'calc(100vh - 232px)', flexDirection: 'column'}} >
              <div className={styles.FilterWrapper}>
                <div style={{display: 'flex', alignItems: 'center', margin: '0 16px 16px 0'}}>
                  <span style={{margin: '0 16px 0 0'}}><b>Student:</b></span>
                  <span style={{margin: '0 16px 0 0'}}>
                    {!this.state.student ? "None" :
                      `${this.state.student.lastName} ${this.state.student.firstName}`}
                  </span>
                  <Button color="normal" clicked={() => {this.setState({isPickingStudent: true})}} disabled={this.state.updating} >Choose...</Button>
                </div>
                <div style={{paddingTop: '6px'}}>
                  <span>Year: </span>
                  <Select
                    className={styles.FilterSelect}
                    style={{marginBottom: '16px'}}
                    placeholder="Select year..."
                    value={this.state.year}
                    onChange={event => this.filterOnChangeHandler(event, 'year')}
                    disabled={this.state.updating}
                  >
                    <Option value={null} hidden>None</Option>
                    {this.state.semesters.map(s => s.year).filter((y, index, self) => self.indexOf(y) === index).map(y => {
                      return (
                        <Option key={y} value={y}>
                          {`${y}-${y-1+2}`}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
              <div style={{
                height: 'calc(100vh - 360px)',
                border: 'thin solid #e8e8e8',
                borderRadius: '4px'
              }}>
                {this.state.updating ? <LoadScreen /> :
                  <div className={styles.FadeWrapper}>
                    <Table
                      dataSource={this.state.subjects}
                      columns={this.state.tableColumns}
                      scroll={{x: 2271, y: 'calc(100vh - 440px)'}}
                      bordered
                      pagination={false}
                      size="small"
                    />
                  </div>
                }
              </div>
            </Card>
          </div>
        )}
      </Fragment>
      );
  }
}

export default ResultView;
