import React, {Component, Fragment} from 'react';
import {Table} from 'antd';
import moment from 'moment';
import styles from './MyClass.module.css';

import AuthContext from '../../../context/auth-context';
import Request from '../../../common/commonRequest';
import LoadScreen from '../../../components/UI/LoadScreen/LoadScreen';
import Card from '../../../components/UI/Card/Card';

class MyClass extends Component {
  state = {
    loading: true,
    hasNoClass: false,
    students: [],
    classInfo: {},
  }

  studentTableColumns = [
    {title: 'Last Name', dataIndex: 'lastName', width: 200, sorter: (a,b) => a.lastName.localeCompare(b.lastName), sortDirections: ['ascend', 'descend']},
    {title: 'First Name', dataIndex: 'firstName', width: 150, sorter: (a,b) => a.firstName.localeCompare(b.firstName), sortDirections: ['ascend', 'descend']},
    {title: 'Gender', dataIndex: 'gender', width: 100, sorter: (a,b) => a.gender.localeCompare(b.gender), sortDirections: ['ascend', 'descend']},
    {title: 'DOB', dataIndex: 'birthdayFormatted', width: 100, sorter: (a, b) => a.birthday.isAfter(b.birthday), sortDirections: ['descend']},
    {title: 'Address', dataIndex: 'address'},
  ];

  teacherTableColumns = [
    {
      title: 'Subject',
      key: 'subject',
      render: (text, record, index) => (
        <span>{record.subject.name}</span>
      ),
    },
    {
      title: 'Teacher',
      key: 'teacher',
      width: 200,
      render: (text, record, index) => (
        <span>{record.teacher.name}</span>
      ),
    },
  ];

  async fetchClass() {
    await Request.get('/Class/Get?headTeacherID='+this.context.teacher.teacherID, 'cred', async(response) => {
      if (response.data.length < 1) {
        this.setState({hasNoClass: true, loading: false});
        return;
      }
      const classObj = response.data[0];
      this.setState({classInfo: classObj});
      // Fetch Student list
      await Request.get('/Student/Get?classID='+classObj.classID, 'cred', response => {
        let newStudents = response.data.map(_student => {
          let newStudent = {};
          newStudent.key = _student.studentID;
          newStudent.lastName = _student.lastName;
          newStudent.firstName = _student.firstName;
          newStudent.gender = _student.gender;
          newStudent.birthday = moment(_student.birthday, 'YYYY/MM/DD');
          newStudent.birthdayFormatted = newStudent.birthday.format('DD/MM/YYYY');
          newStudent.address = _student.address;
          newStudent.class = _student.class;
          return newStudent;
        });
        this.setState({students: newStudents});
      });
      // Fetch Assigned Teachers
      await this.fetchTeachingAssignments(classObj.classID);
      this.setState({loading: false});
    });
  }

  async fetchTeachingAssignments(_classID) {
    let teachingAssignmentPromise = await Request.get('/TeachingAssignment/Get?classID='+_classID, 'cred');
    let _teachingAssignments = teachingAssignmentPromise.data;
    _teachingAssignments = _teachingAssignments.map(tA => {
      let newTA = JSON.parse(JSON.stringify(tA));
      newTA.key = tA.teachingAssignmentID;
      return newTA;
    });
    this.setState({teachingAssignments: _teachingAssignments});
  }

  async componentDidMount() {
    await this.fetchClass();
  }

  render() {
    return (
      <Fragment>
        {this.state.loading ? <LoadScreen /> : 
            this.state.hasNoClass ? <p>You are not a head teacher of any class</p> : (
              <div className={styles.MyClass}>
                <h1>My Class</h1>
                <p>View your class information</p>
                <Card
                  style={{
                    height: 'calc(100vh - 232px)',
                    flexDirection: 'row',
                  }}
                >
                  {/* Class Info */}
                  <div style={{width: '100%'}}>
                    <h2>Class {this.state.classInfo.name}</h2>
                    <p><b>Grade: </b>{this.state.classInfo.grade.name}</p>
                    <p><b>Year: </b>{this.state.classInfo.year+"-"+(this.state.classInfo.year-1+2)}</p>
                    <br />
                    <p><b>Head Teacher: </b>{this.state.classInfo.headTeacher.name}</p>
                    <p><b>Number of students: </b>{this.state.students.length}</p>
                    <div style={{
                      height: 'calc(100vh - 501px)',
                      border: 'thin solid #e8e8e8',
                      borderRadius: '4px',
                      marginRight: '16px',
                    }}>
                      <Table
                        dataSource={this.state.teachingAssignments}
                        columns={this.teacherTableColumns}
                        scroll={{y: 'calc(100vh - 581px)'}}
                        title={() => 'Assigned Teachers'}
                        pagination={false}
                        size="small"
                        bordered
                      />
                    </div>
                  </div>
                  {/* Student List */}
                  <div style={{width: '100%'}}>
                    <div style={{
                      height: '100%',
                      border: 'thin solid #e8e8e8',
                      borderRadius: '4px',
                      marginLeft: '32px',
                    }}>
                      <Table
                        dataSource={this.state.students}
                        columns={this.studentTableColumns}
                        scroll={{x: 'calc(100% + 400px)', y: 'calc(100vh - 378px)'}}
                        title={() => 'Students'}
                        pagination={false}
                        size="small"
                        bordered
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )
        }
      </Fragment>
    );
  }
}

MyClass.contextType = AuthContext;
export default MyClass;
