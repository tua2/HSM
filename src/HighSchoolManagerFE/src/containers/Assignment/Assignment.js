import React, {Component, Fragment} from 'react';
import {Input, Select, Table, Popconfirm, message} from 'antd';
import styles from './Assignment.module.css';

import Fetch from '../../common/commonFetch';
import Request from '../../common/commonRequest';
import LoadScreen from '../../components/UI/LoadScreen/LoadScreen';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';

const {Option, OptGroup} = Select;

class Assignment extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    callUpdateTeacher: false,
    callAddAssignment: false,
    filters: {
      name: '',
      classID: null,
      subjectID: null,
    },
    filteredTeachers: [],
    teachers: [],
    subjects: [],
    classes: [],
    teachingAssignments: [],

    addingAssignment: {
      teacherID: null,
      classID: null,
      subjectID: null,
    },

    tableColumns: [
      {
        title: 'Teacher',
        width: 232,
        key: 'teacher',
        render: (text, record, index) => (
          <Select
            value={record.teacher.teacherID}
            style={{width: '100%'}}
            onChange={(event) => this.assignmentOnChangeHandler(record.teachingAssignmentID, event, record.classID, record.subjectID)}
          >
            {this.state.teachers.map(s => (
              <Option key={s.teacherID} value={s.teacherID}>
                {s.name}
              </Option>
            ))}
          </Select>
        ),
        sorter: (a,b) => a.teacher.name.localeCompare(b.teacher.name),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Class',
        width: 200,
        key: 'class',
        render: (text, record, index) => (
          <Select
            value={record.class.classID}
            style={{width: '100%'}}
            onChange={(event) => this.assignmentOnChangeHandler(record.teachingAssignmentID, record.teacherID, event, record.subjectID)}
          >
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
        ),
        sorter: (a,b) => a.class.name.localeCompare(b.class.name),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Subject',
        key: 'subject',
        render: (text, record, index) => (
          <Select
            value={record.subject.subjectID}
            style={{width: '100%', maxWidth: '200px'}}
            onChange={(event) => this.assignmentOnChangeHandler(record.teachingAssignmentID, record.teacherID, record.classID, event)}
          >
            {this.state.subjects.map(s => (
              <Option key={s.subjectID} value={s.subjectID}>
                {s.name}
              </Option>
            ))}
          </Select>
        ),
        sorter: (a,b) => a.subject.name.localeCompare(b.subject.name),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Action',
        width: 75,
        fixed: 'right',
        key: 'action',
        render: (text, record, index) => (
          <Popconfirm
            title="Are you sure wanted to delete this assignment?"
            okText="Yes"
            cancelText="No"
            placement="topRight"
            onConfirm={() => this.deleteAssignmentHandler(record.teachingAssignmentID)}
          >
            <a href="./">Delete</a>
          </Popconfirm>
        ),
      },
    ],
  }

  filterOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let _filters = {...this.state.filters};
    _filters[key] = value;
    this.setState({filters: _filters});
    if (key !== 'name')
      this.setState({callUpdate: true, updating: true});
  };

  modelOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let _model = {...this.state.addingAssignment};
    _model[key] = value;
    this.setState({addingAssignment: _model});
  };

  newAssignmentHandler = async () => {
    const _assignment = {...this.state.addingAssignment};
    const reqMessage = message.loading('Submitting', 9000);
    this.setState({callAddAssignment: true});
    await Request.post('/TeachingAssignment/Create', _assignment, 'cred',
      () => {
        this.setState({addingAssignment: {teacherID: null, classID: null, subjectID: null}});
        this.setState({callUpdate: true, updating: true});
        this.setState({callAddAssignment: false});
        setTimeout(reqMessage, 0);
      },
      error => {
        this.setState({callAddAssignment: false});
        setTimeout(reqMessage, 0);
        if (_assignment.teacherID && _assignment.classID && _assignment.subjectID)
          message.error(error.response.data.messages[0]);
        else {
          message.error("Assignment has insufficient information");
        }
      },
    );
  }

  deleteAssignmentHandler = (assignmentID) => {
    const reqMessage = message.loading('Submitting', 9000);
    Request.delete('/TeachingAssignment/Delete?teachingAssignmentID='+assignmentID, 'cred',
      () => {
        this.setState({callUpdate: true, updating: true});
        setTimeout(reqMessage, 0);
      },
      error => {
        setTimeout(reqMessage, 0);
      },
    );
  }

  assignmentOnChangeHandler = (_teachingAssignmentID, _teacherID, _classID, _subjectID) => {
    const reqMessage = message.loading('Submitting', 9000);
    Request.put(
      '/TeachingAssignment/Edit?assignmentID='+_teachingAssignmentID,
      {teacherID: _teacherID, classID: _classID, subjectID: _subjectID},
      'cred',
      response => {
        setTimeout(reqMessage, 0);
        let newTeachingAssignments = [...this.state.teachingAssignments];
        newTeachingAssignments
          .filter(tA => tA.teachingAssignmentID === _teachingAssignmentID)[0].teacher = response.data.teacher;
        newTeachingAssignments
          .filter(tA => tA.teachingAssignmentID === _teachingAssignmentID)[0].class = response.data.class;
        newTeachingAssignments
          .filter(tA => tA.teachingAssignmentID === _teachingAssignmentID)[0].subject = response.data.subject;
        newTeachingAssignments.filter(tA => tA.teachingAssignmentID === _teachingAssignmentID)[0].teacherID = _teacherID;
        newTeachingAssignments.filter(tA => tA.teachingAssignmentID === _teachingAssignmentID)[0].classID = _classID;
        newTeachingAssignments.filter(tA => tA.teachingAssignmentID === _teachingAssignmentID)[0].subjectID = _subjectID;
        this.setState({teachingAssignments: newTeachingAssignments});
      },
      error => {
        setTimeout(reqMessage, 0);
        Request.showError(error);
      }
    )
  }

  async componentDidMount() {
    await Promise.all([Fetch.fetchTeachers(this, ['name']), Fetch.fetchClasses(this), Fetch.fetchSubjects(this)]);
    await Fetch.fetchTeachingAssignments(this, ['classID', 'subjectID']);
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      if (this.state.callUpdateTeacher)
        await Fetch.fetchTeachers(this, ['name']);
      await Fetch.fetchTeachingAssignments(this, ['classID', 'subjectID']);
      this.setState({updating: false});
    }
  }

  render() {
    return (
      <Fragment>
        {this.state.loading ? <LoadScreen style={{position: 'fixed', top: '64px', left: '225px'}} /> : (
          <div className={[styles.Assignment, styles.FadeWrapper].join(' ')}>
            <h1>Teaching Assignment</h1>
            <p>Assign teachers to classes and subject</p>
            <Card style={{height: 'calc(100vh - 232px)', flexDirection: 'column'}} >
              <div className={styles.FilterWrapper}>
                <div>
                  <span>Name: </span>
                  <Input
                    className={styles.FilterInput}
                    placeholder="Teacher name"
                    value={this.state.filters.name}
                    onChange={event => this.filterOnChangeHandler(event, 'name')}
                    onKeyPress={event => {if (event.key === 'Enter') {this.setState({callUpdate: true, updating: true, callUpdateTeacher: true})}}}
                  />
                </div>
                <div>
                  <span>Class: </span>
                  <Select
                    className={styles.FilterSelect}
                    placeholder="Select class..."
                    value={this.state.filters.classID}
                    onChange={event => this.filterOnChangeHandler(event, 'classID')}
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
                  <span>Subject:</span>
                  <Select
                    className={styles.FilterSelect}
                    value={this.state.filters.subjectID}
                    onChange={event => this.filterOnChangeHandler(event, 'subjectID')}
                  >
                    <Option value={null}>All</Option>
                    {this.state.subjects.map(s => (
                      <Option value={s.subjectID} key={s.subjectID}>{s.name}</Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Button
                    color="normal"
                    icon="fa-redo"
                    style={{
                      height: '32px',
                      marginBottom: '32px',
                      padding: '0.1rem calc(0.6rem - 10px) 0rem 0.6rem',
                    }}
                    clicked={() => {this.setState({callUpdate: true, updating: true})}}
                  >
                  </Button>
                </div>
              </div>
              <div className={styles.TableWrapper}>
                <div style={{
                  height: 'calc(100vh - 360px)',
                  border: 'thin solid #e8e8e8',
                  borderRadius: '4px'
                }}>
                  {this.state.updating ? <LoadScreen /> :
                    <Fragment>
                      <div className={styles.FadeWrapper} style={{height: 'calc(100vh - 491px)'}}>
                        <Table
                          columns={this.state.tableColumns}
                          dataSource={this.state.teachingAssignments}
                          scroll={{y: 'calc(100vh - 530px)'}}
                          pagination={false}
                          size="small"
                          bordered
                        />
                      </div>
                      {/* ADD ASSIGNMENT */}
                      <div className={styles.FadeWrapper} style={{borderTop: 'thin solid #e8e8e8'}}>
                        <Table
                          scroll={{y: 335}}
                          columns={[
                            {
                              title: 'Add Assignment',
                              width: 232,
                              fixed: 'left',
                              key: 'teacher',
                              render: (text, record, index) => (
                                <Select
                                  style={{width: '100%'}}
                                  placeholder="Select teacher..."
                                  value={
                                    this.state.addingAssignment.teacherID ?
                                    this.state.teachers.filter(t => t.teacherID === this.state.addingAssignment.teacherID)[0].name : null
                                  }
                                  onChange={event => this.modelOnChangeHandler(event, 'teacherID')}
                                >
                                  <Option value={null} hidden>Select teacher...</Option>
                                  {this.state.teachers.map(t => (
                                    <Option value={t.teacherID} key={t.teacherID}>{t.name}</Option>
                                  ))}
                                </Select>
                              )
                            },
                            {
                              width: 200,
                              key: 'class',
                              render: (text, record, index) => (
                                <Select
                                  style={{width: '100%'}}
                                  placeholder="Select class..."
                                  value={
                                    this.state.addingAssignment.classID ?
                                    this.state.classes.filter(c => c.classID === this.state.addingAssignment.classID)[0].name : null
                                  }
                                  onChange={event => this.modelOnChangeHandler(event, 'classID')}
                                >
                                  <Option value={null} hidden>Select class...</Option>
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
                              )
                            },
                            {
                              key: 'subject',
                              render: (text, record, index) => (
                                <Select
                                  className={styles.FilterSelect}
                                  placeholder="Select subject..."
                                  style={{width: '100%', maxWidth: '200px'}}
                                  value={
                                    this.state.addingAssignment.subjectID ?
                                    this.state.subjects.filter(s => s.subjectID === this.state.addingAssignment.subjectID)[0].name : null
                                  }
                                  onChange={event => this.modelOnChangeHandler(event, 'subjectID')}
                                >
                                  <Option value={null} hidden>Select subject...</Option>
                                  {this.state.subjects.map(s => (
                                    <Option value={s.subjectID} key={s.subjectID}>{s.name}</Option>
                                  ))}
                                </Select>
                              )
                            },
                            {
                              key: 'action',
                              width: 100,
                              fixed: 'right',
                              render: (text, record, index) => (
                                <Button
                                  color="primary"
                                  clicked={this.newAssignmentHandler}
                                  disabled={this.state.callAddAssignment}
                                >
                                  Add
                                </Button>
                              )
                            },
                          ]}
                          dataSource={[
                            {key: 'addingAssignment'},
                          ]}
                          pagination={false}
                        />
                      </div>
                    </Fragment>
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

export default Assignment;
