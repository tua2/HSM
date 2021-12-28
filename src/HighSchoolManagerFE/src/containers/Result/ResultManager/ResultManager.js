import React, {Component} from 'react';
import {Table, Input, Select, message} from 'antd';
import styles from './ResultManager.module.css';

import AuthContext from '../../../context/auth-context';
import Fetch from '../../../common/commonFetch';
import Request from '../../../common/commonRequest'
import Card from '../../../components/UI/Card/Card';
import LoadScreen from '../../../components/UI/LoadScreen/LoadScreen';

const {Option, OptGroup} = Select;

class ResultManager extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    callChangeClass: false,
    students: [],
    semesters: [],
    assignedClasses: [],
    subjects: [],
    formattedClasses: [],
    classes: [],
    //year: 0,
    subjectID: null,
    classID: null,

    filters: {
      year: 0,
    },
    currentMarkModel: {
      studentID: null,
      month: null,
      type: null,
      mark: null,
    },

    markInputEvents: [],
    tableColumns: [
      {
        title: 'Student',
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

  monthArr = [9, 10, 11, 12, 2, 3, 4, 5];
  columnKeys = ['m1t1', 'm1t2', 'm2t1', 'm2t2', 'm3t1', 'm3t2', 'm4t1', 'm4t2', 's1',
    'm5t1', 'm5t2', 'm6t1', 'm6t2', 'm7t1', 'm7t2', 'm8t1', 'm8t2', 's2'];

  toKeyIndex(key) {
    let keyIndex = 20;
    for (let i=0; i < this.columnKeys.length; i++) {
      if (key === this.columnKeys[i])
        keyIndex = i;
    }
    return keyIndex;
  }
  toStudentIndex = (studentID) => {
    let studentIndex = 0;
    for (let i=0; i < this.state.students.length; i++) {
      if (studentID === this.state.students[i].key)
        studentIndex = i;
    }
    return studentIndex;
  }
  monthToSemester = (_month) => {
    return (_month >= 9 && _month <= 12) ? this.state.semesters.filter(s => s.label === 1)[0].semesterID : this.state.semesters.filter(s => s.label === 2)[0].semesterID;
  }

  filterOnChangeHandler = (event, key) => {
    const value = event;
    if (key === 'classID')
      this.setState({callChangeClass: true});
    this.setState({[key]: value, callUpdate: true, updating: true});
  }

  markOnFocusHandler = (studentID, mark, month, type, key) => {
    // identifierKey(key) to numberKey(keyIndex) (eg: 2 -> m1t2)
    let newModel = {...this.state.currentMarkModel};
    newModel.studentID = studentID;
    newModel.mark = mark;
    newModel.month = month;
    newModel.type = type;
    newModel.keyIndex = this.toKeyIndex(key);
    this.setState({currentMarkModel: newModel});
  }
  markOnBlurHandler = (_studentID, _mark, _month, _type) => {
    const currentResultDetail = this.state.students.filter(s => s.key === _studentID)[0].resultDetails.filter(rD => rD.month === _month && rD.resultTypeID === _type)[0];
    if (
      (currentResultDetail &&
        _mark !== currentResultDetail.mark) ||
      (!currentResultDetail && _mark !== null && !_mark !== "")
    )
      this.submitMarkHandler(_studentID, _mark, _month, _type);
    this.setState({currentMarkModel: {studentID: null, mark: null, month: null, type: null, keyIndex: null}});
  }
  markOnChangeHandler = (event) => {
    let newModel = {...this.state.currentMarkModel};
    newModel.mark = event.target.value;
    this.setState({currentMarkModel: newModel});
  }

  submitMarkHandler = async (_studentID, _mark, _month, _type) => {
    if (isNaN(_mark) || _mark < 0 || _mark > 10) {
      message.error("Result must range from 0 to 10");
      return;
    }
    const reqMessage = message.loading('Submitting', 9000);
    console.log(_studentID, this.monthToSemester(_month), this.state.subjectID, _month, parseFloat(_mark), _type);
    let newResultDetailsPromise = await Request.post('/Result/UpdateMark', {
      studentID: _studentID,
      semesterID: this.monthToSemester(_month),
      subjectID: this.state.subjectID,
      month: _month,
      mark: parseFloat(_mark),
      resultTypeID: _type,
    }, 'cred', () => {}, error => {
      console.log(error.response);
      setTimeout(reqMessage, 0);
      message.error("Submitting failed");
    });
    let newStudents = [...this.state.students];
    let _student = newStudents.filter(s => s.key === _studentID)[0];
    const isNewResult = _student.resultDetails.filter(rD => {
      if (rD.month === _month && rD.resultTypeID === _type)
        return true;
      return false;
    }).length < 1;
    if (!isNewResult)
      _student.resultDetails = _student.resultDetails.filter(rD => !(rD.month === _month && rD.resultTypeID === _type));
    _student.resultDetails.push(newResultDetailsPromise.data);
    _student.resultAvgs = await this.getSubjectMonthlyAverages(_studentID);
    _student.resultYearAvgs = await this.getSubjectYearlyAverages(_studentID);
    setTimeout(reqMessage, 0);
    this.setState({students: newStudents});
  }

  setupMarkColumns() {
    let markColumns = JSON.parse(JSON.stringify(this.state.tableColumns));
    markColumns.forEach(c => {
      if (c.title === 'Student') {
        c.render = (text, record, index) => (<span>{record.lastName} <b>{record.firstName}</b></span>);
        //c.sorter = (a,b) => a.firstName.localeCompare(b.firstName); 
        //c.sortDirections = ['ascend', 'descend'];
        return;
      }
      c.children.forEach(cChild => {
        cChild.width = 70;
        cChild.render = (text, record, index) => {
          let _mark = record.resultDetails.filter(rD => rD.month === cChild.month && rD.resultTypeID === cChild.type)[0];
          const newStudentID = record.key;
          const newMark = _mark ? _mark.mark : null;
          const newMonth = cChild.month;
          const newType = cChild.type;
          const newKey = cChild.key;
          if (cChild.title === "Avg") {
            let avg = null;
            const resultAvg = record.resultAvgs.filter(rA => rA.month === newMonth)[0];
            if (resultAvg)
              avg = resultAvg.average;
            return (
              <Input
                className={styles.MarkInput}
                value={avg}
                disabled
              />
            )
          }
          if (cChild.title === "S.Avg") {
            const newSemesterIndex = cChild.semesterIndex;
            let avg = null;
            const resultYearAvg = record.resultYearAvgs.filter(rYA => rYA.semesterIndex === newSemesterIndex)[0];
            if (resultYearAvg)
              avg = resultYearAvg.average;
            return (
              <Input
                className={styles.MarkInput}
                value={avg}
                disabled
              />
            )
          }
          return (
            <Input
              className={styles.MarkInput}
              value={
                (this.state.currentMarkModel.studentID &&
                  this.state.currentMarkModel.studentID === newStudentID &&
                  this.state.currentMarkModel.month === cChild.month && this.state.currentMarkModel.type === cChild.type) ?
                  this.state.currentMarkModel.mark : newMark
              }
              ref={this.state.markInputEvents[this.toStudentIndex(newStudentID)][this.toKeyIndex(newKey)]}
              onFocus={() => this.markOnFocusHandler(newStudentID, newMark, newMonth, newType, newKey)}
              onBlur={() => this.markOnBlurHandler(newStudentID, this.state.currentMarkModel.mark, newMonth, newType)}
              onChange={(event) => this.markOnChangeHandler(event)}
              onKeyDown={(event) => {
                if (event.key === 'Enter')
                  this.submitMarkHandler(newStudentID, this.state.currentMarkModel.mark, newMonth, newType);
                // Pressing ESC
                if (event.key === 'Escape') {
                  event.preventDefault();
                  let newModel = {...this.state.currentMarkModel};
                  newModel.mark = this.state.students.filter(s => s.key === newStudentID)[0].resultDetails
                    .filter(rD => rD.month === newMonth && rD.resultTypeID === newType)[0].mark;
                  this.setState({currentMarkModel: newModel});
                }
                if (event.key === 'Tab') {
                  event.preventDefault();
                  let focusThisMark = this.state.markInputEvents[this.toStudentIndex(newStudentID)+1];
                  if (event.shiftKey)
                  focusThisMark = this.state.markInputEvents[this.toStudentIndex(newStudentID)-1];
                  if (focusThisMark) {
                    focusThisMark[this.toKeyIndex(newKey)].current.focus();
                  }
                }
              }}
            />
          );
        };
      });
    });
    this.setState({tableColumns: markColumns});
  }

  async fetchAssignedClasses() {
    let teachingAssignmentPromise = await Request.get(`/TeachingAssignment/Get?teacherID=${this.context.teacher.teacherID}`, 'cred');
    let _classIDArr = teachingAssignmentPromise.data.map(tA => tA.classID);
    this.setState({
      assignedClasses: _classIDArr,
    })
  }

  async fetchClasses() {
    let _classesPromise = await Request.get('/Class/Get', 'cred');
    let _classes = _classesPromise.data;
    let _formattedClasses = _classesPromise.data.reduce((classesArr, cls) => {
      if (this.state.assignedClasses.indexOf(cls.classID) >= 0) {
        if (!classesArr[cls.year]) {
          classesArr[cls.year] = [];
        }
        classesArr[cls.year].push(cls);
      }
      return classesArr;
    }, {});
    this.setState({classes: _classes, formattedClasses: _formattedClasses});
  }

  async fetchSubjects() {
    if (!this.state.classID) {
      return;
    }

    let assignedSubjectsPromise = await Request.get(`/TeachingAssignment/Get?teacherID=${this.context.teacher.teacherID}&classID=${this.state.classID}`, 'cred');
    let assignedSubjects = assignedSubjectsPromise.data
      .map(tA => tA.subject.subjectID)
      .filter((s, index, self) => self.indexOf(s) === index);

    let _subjectsPromise = await Request.get('/Subject/Get', 'cred');
    let _subjects = _subjectsPromise.data.filter(s => assignedSubjects.includes(s.subjectID));

    this.setState({subjects: [..._subjects], subjectID: null});
    if (_subjects[0])
      this.setState({subjectID: _subjects[0].subjectID});
  }

  async getSubjectMonthlyAverages(studentID) {
    let resultAvgs = [];
    let subjectMonthlyAveragePromise = await Request
      .get(`/Result/SubjectMonthlyAverages?studentID=${studentID}&year=${this.state.filters.year}&subjectID=${this.state.subjectID}`, 'cred');
    resultAvgs = subjectMonthlyAveragePromise.data.averages;
    return resultAvgs;
  }

  async getSubjectYearlyAverages(studentID) {
    let resultYearAvgs = [];
    let subjectYearlyAveragePromise = await Request
      .get(`/Result/SubjectYearlyAverages?studentID=${studentID}&year=${this.state.filters.year}&subjectID=${this.state.subjectID}`, 'cred');
    resultYearAvgs = subjectYearlyAveragePromise.data;
    return resultYearAvgs;
  }

  async fetchStudentsResults() {
    let newStudents = [];
    if (this.state.classID) {
      let newStudentsPromise = await Request.get('/Student/Get?classID='+this.state.classID, 'cred');
      for (const _student of newStudentsPromise.data) {
        let newStudent = {};
        newStudent.key = _student.studentID;
        newStudent.lastName = _student.lastName;
        newStudent.firstName = _student.firstName;
        newStudent.resultDetails = [];
        // resultDetails - Subject ResultDetails of Semesters
        //TODO: get semesters of selected years only
        for (let sem of this.state.semesters.filter(s => s.year === this.state.filters.year)) {
          let semesterResultDetailsPromise = await Request
            .get(`/Result/Get?studentID=${newStudent.key}&semesterID=${sem.semesterID}&subjectID=${this.state.subjectID}`, 'cred');
          const _resultDetails = semesterResultDetailsPromise.data[0] ? semesterResultDetailsPromise.data[0].resultDetails : null;
          if (_resultDetails) {
            for (let rD of _resultDetails) {
              newStudent.resultDetails.push(rD);
            };
          }
        };
        // resultAvgs - SubjectMonthlyAverage
        newStudent.resultAvgs = await this.getSubjectMonthlyAverages(newStudent.key);
        newStudent.resultYearAvgs = await this.getSubjectYearlyAverages(newStudent.key);
        newStudents.push(newStudent);
      };
    }
    this.setState({students: newStudents});
  }

  markInputEventsInitialize() {
    let markInputEvents = [];
    for (let i=0; i < this.state.students.length; i++) {
      for (let j=0; j < 20; j++) {
        if (!markInputEvents[i]) {
          markInputEvents[i] = [];
        }
        markInputEvents[i][j] = React.createRef();
      }
    }
    this.setState({markInputEvents: markInputEvents});
  }

  async componentDidMount() {
    await this.fetchAssignedClasses();
    await Promise.all([this.fetchClasses(), this.fetchSubjects(), Fetch.fetchSemesters(this)]);
    await this.fetchStudentsResults();
    this.markInputEventsInitialize();
    this.setupMarkColumns();

    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await this.fetchAssignedClasses();
      if (this.state.callChangeClass) {
        let newFilters = {...this.state.filters};
        newFilters.year = this.state.classes.filter(c => c.classID === this.state.classID)[0].year;
        this.setState({subjectID: null, filters: newFilters});
        this.setState({callChangeClass: false});
        await Promise.all([this.fetchSubjects(), Fetch.fetchSemesters(this)]);
      }
      await this.fetchStudentsResults();
      this.markInputEventsInitialize();
      this.setState({updating: false});
    }
  }

  render() {
    return (
      this.state.loading ? <LoadScreen /> : (
        <div className={[styles.ResultManager, styles.FadeWrapper].join(' ')}>
          <h1>Manage Results</h1>
          <p>Manage student's results whose class is assigned for you</p>
          <Card style={{height: 'calc(100vh - 232px)', flexDirection: 'column'}} >
            <div className={styles.FilterWrapper}>
              <div>
                <span>Class: </span>
                <Select
                  className={styles.FilterSelect}
                  placeholder="Select class..."
                  value={this.state.classID}
                  onChange={event => this.filterOnChangeHandler(event, 'classID')}
                  disabled={this.state.updating}
                >
                  <Option value={null} hidden>None</Option>
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
                <span>Subject:</span>
                <Select
                  className={styles.FilterSelect}
                  value={
                    (this.state.subjects.length>0 && this.state.subjectID) ?
                    this.state.subjects.filter(s => s.subjectID === this.state.subjectID)[0].subjectID : null
                  }
                  onChange={event => this.filterOnChangeHandler(event, 'subjectID')}
                  disabled={this.state.subjects.length < 1 || this.state.updating}
                >
                  <Option value={null} hidden>None</Option>
                  {this.state.subjects.map(s => (
                    <Option value={s.subjectID} key={s.subjectID}>{s.name}</Option>
                  ))}
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
                    dataSource={this.state.students}
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
      )
    );
  }
}

ResultManager.contextType = AuthContext;

export default ResultManager;
