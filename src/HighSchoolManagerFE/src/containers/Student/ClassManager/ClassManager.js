import React, {Component, Fragment} from 'react';
import {Route, Link} from 'react-router-dom';
import {Table, Select, Input, message} from 'antd';
import moment from 'moment';
import styles from './ClassManager.module.css';

import ClassPickerContext from '../../../context/classpicker-context';
import Fetch from '../../../common/commonFetch';
import Request from '../../../common/commonRequest';
import Modal from '../../../components/UI/Modal/Modal';
import Button from '../../../components/UI/Button/Button';
import Card from '../../../components/UI/Card/Card';
import LoadScreen from '../../../components/UI/LoadScreen/LoadScreen';
import ClassPickerModal from '../../../components/Partial/ClassPicker/ClassPicker';
import CreateClass from './CreateClass/CreateClass';

const {Option} = Select;

class ClassManager extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    isPickingClass1: false,
    isPickingClass2: false,
    class1_info: {},
    class2_info: {},
    class1_students: [],
    class2_students: [],
    class1_movingStudents: [],
    class2_movingStudents: [],
    classes: [],
    teachers: [],
    isCreatingClass: false,
  }

  tableColumns = [
    {title: 'Last Name', dataIndex: 'lastName', width: 200, sorter: (a,b) => a.lastName.localeCompare(b.lastName), sortDirections: ['ascend', 'descend']},
    {title: 'First Name', dataIndex: 'firstName', width: 150, sorter: (a,b) => a.firstName.localeCompare(b.firstName), sortDirections: ['ascend', 'descend']},
    {title: 'Gender', dataIndex: 'gender', width: 100, sorter: (a,b) => a.gender.localeCompare(b.gender), sortDirections: ['ascend', 'descend']},
    {title: 'DOB', dataIndex: 'birthdayFormatted', width: 200, sorter: (a, b) => a.birthday.isAfter(b.birthday), sortDirections: ['descend']},
  ]

  modalClosedHandler = () => {
    if (this.state.isCreatingClass) {
      if (!window.confirm("Are you sure wanted to quit? Any unsaved changes will be discarded"))
        return;
    }
    this.props.history.push('/Student/ClassManager');
  }

  modelOnChangeHandler = (event, key, classIndex) => {
    let classModel = {};
    if (classIndex === 1)
      classModel = {...this.state.class1_info};
    else
      classModel = {...this.state.class2_info};
    const value = event ? (event.target ? event.target.value : event) : null;
    classModel[key] = value;
    if (key === "name" && value === "") {
      const gradeStr = classIndex===1 ? this.state.class1_info.grade.name : this.state.class2_info.grade.name;
      classModel.name = gradeStr+"/?";
    }
    if (classIndex === 1)
      this.setState({class1_info: classModel});
    else
      this.setState({class2_info: classModel});
  }

  updateClassHandler = (classIndex) => {
    let classModel = {};
    if (classIndex === 1)
      classModel = {...this.state.class1_info};
    else
      classModel = {...this.state.class2_info};
    Request.put('/Class/Edit/?classid='+classModel.classID, {
      "name": classModel.name,
      "year": classModel.year,
      "gradeID": classModel.gradeID,
      "headTeacherID": classModel.headTeacherID,
    }, 'cred', response => {
      if (classIndex === 1)
        this.setState({class1_info: response.data});
      else
        this.setState({class2_info: response.data});
      this.setState({callUpdate: true, updating: true});
    }, error => {
      console.log(error.response);
      Request.showError(error);
      if (classIndex === 1) classModel = {...this.state.class1_info}; else classModel = {...this.state.class2_info};
      classModel.headTeacherID = classModel.headTeacher ? classModel.headTeacher.teacherID : null;
      classModel.name = this.state.classes.filter(c => c.classID === classModel.classID)[0].name;
      if (classIndex === 1) this.setState({class1_info: classModel}); else this.setState({class2_info: classModel});
      this.setState({callUpdate: true, updating: true});
    });
  }

  updateStudentClassHandler = (studentList, classID) => {
    const destClassSize = (this.state.class1_info.classID === classID) ? this.state.class1_students.length : this.state.class2_students.length;
    if (studentList.length + destClassSize > 40) {
      message.error("Class size must be less than 40");
      return;
    }
    Request.put('/Class/AddStudentsToClass?classid='+classID, {
      'ids': studentList
    }, 'cred', response => {
      this.setState({class1_movingStudents: [], class2_movingStudents: []});
      this.setState({callUpdate: true, updating: true});
    }, error => {console.log(error.response)});
  }

  async fetchStudentsOfClass1() {
    await Request.get('/Student/Get?classid='+this.state.class1_info.classID, 'cred', response => {
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
      this.setState({class1_students: newStudents});
    });
  }
  async fetchStudentsOfClass2() {
    await Request.get('/Student/Get?classid='+this.state.class2_info.classID, 'cred', response => {
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
      this.setState({class2_students: newStudents});
    });
  }

  async fetchDefaultClasses() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    await Request.get('/Class/Get?year='+currentYear, 'cred', response => {
      if (response.data.length < 2) {
        const emptyClass = {classID: 0};
        this.setState({class1_info: emptyClass, class2_info: emptyClass});
      }
      else
        this.setState({class1_info: response.data[0], class2_info: response.data[1]});
    });
  }

  async fetchClasses() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    this.setState({classes: []});
    let emptyClass = [
      {
        classID: 0,
        name: "No class",
        year: currentYear,
        gradeID: 0,
        grade: {"gradeID": 0, "name": "None"},
        headTeacherID: null,
        headTeacher: null,
      },
    ];
    await Request.get('/Class/Get', 'cred', response => {
      this.setState({classes: [...emptyClass, ...response.data]});
    });
  }

  async componentDidMount() {
    await Promise.all([this.fetchClasses(), Fetch.fetchTeachers(this)]);
    await this.fetchDefaultClasses();
    await Promise.all([this.fetchStudentsOfClass1(), this.fetchStudentsOfClass2()]);
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await this.fetchClasses();
      await Promise.all([this.fetchStudentsOfClass1(), this.fetchStudentsOfClass2()]);
      this.setState({updating: false});
    }
  }

  render() {
    return (
      <Fragment>
        <Route path="/Student/ClassManager/Create" render={() => (
          <Modal modalClosed={this.modalClosedHandler}>
            <CreateClass
              creating={this.state.isCreatingClass}
              changeState={(state) => this.setState({isCreatingClass: state})}
              finish={() => {this.setState({callUpdate: true, updating: true}); this.modalClosedHandler()}}
            />
          </Modal>
        )} />
        <ClassPickerContext.Provider value={{
          isPicking: this.state.isPickingClass1,
          classID: this.state.class1_info ? this.state.class1_info.classID : null,
          changeClass: (classID) => {
            if (classID === this.state.class2_info.classID) {
              message.error("This class is already selected");
              return;
            }
            this.setState({
              class1_info: this.state.classes.filter(s => s.classID === classID)[0],
              class1_movingStudents: [],
              callUpdate: true, updating: true
            });
          },
          stopPicking: () => {this.setState({isPickingClass1: false})},
        }}>
          {!this.state.isPickingClass1 ? null :
            <ClassPickerModal defaultClass={this.state.class1_info.classID} />
          }
        </ClassPickerContext.Provider>
        <ClassPickerContext.Provider value={{
          isPicking: this.state.isPickingClass2,
          classID: this.state.class2_info ? this.state.class2_info.classID : null,
          changeClass: (classID) => {
            if (classID === this.state.class1_info.classID) {
              message.error("This class is already selected");
              return;
            }
            this.setState({
              class2_info: this.state.classes.filter(s => s.classID === classID)[0],
              class2_movingStudents: [],
              callUpdate: true, updating: true
            });
          },
          stopPicking: () => {this.setState({isPickingClass2: false})},
        }}>
          {!this.state.isPickingClass2 ? null :
            <ClassPickerModal defaultClass={this.state.class2_info.classID} />
          }
        </ClassPickerContext.Provider>
        {this.state.loading ? <LoadScreen /> :
          <div className={styles.ClassManager}>
            <h1>Class Manager</h1>
            <p>Add, rename classes; assign head teachers; transfer students between classes</p>
            <p>
              <Link to="/Student/ClassManager/Create">
                <Button color="primary" icon="fa-plus">
                  New Classes
                </Button>
              </Link>
            </p>
            <Card style={{flexDirection: 'row', height: 'calc(100vh - 290px)'}}>
              {/*LEFT PANEL*/}
              <div style={{width: 'calc(50vw - 210px)'}}>
                <div className={styles.FilterWrapper} style={{marginBottom: '16px'}}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{width: '34px', margin: '0 16px 0 0'}}><b>Class:</b></span>
                    <span style={{width: '116px', margin: '0 16px 0 0'}}>
                      {this.state.class1_info.classID === 0 ? this.state.class1_info.name :
                      this.state.class1_info.name+` (${this.state.class1_info.year}-${this.state.class1_info.year-1+2})`}
                    </span>
                    <Button color="normal" clicked={() => {this.setState({isPickingClass1: true})}}>Choose...</Button>
                  </div>
                </div>
                <div className={styles.FilterWrapper}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{width: '100px'}}>Class Name:</span>
                    <Input
                      className={styles.FilterInput}
                      value={this.state.class1_info ? this.state.class1_info.name : ""}
                      onChange={e => this.modelOnChangeHandler(e, 'name', 1)}
                      onBlur={() => this.updateClassHandler(1)}
                      disabled={this.state.class1_info.classID === 0}
                    />
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{width: '100px'}}>Head Teacher:</span>
                    <Select
                      className={styles.FilterSelect}
                      value={this.state.class1_info.headTeacherID}
                      onChange={e => this.modelOnChangeHandler(e, 'headTeacherID', 1)}
                      onBlur={() => this.updateClassHandler(1)}
                      disabled={this.state.class1_info.classID === 0}
                    >
                      <Option value={null}>None</Option>
                      {this.state.teachers.map(t => (
                        <Option key={t.teacherID} value={t.teacherID}>
                          {t.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div style={{
                  height: 'calc(100vh - 529px)',
                  marginTop: '16px',
                  border: 'thin solid #e8e8e8',
                  borderRadius: '4px'
                }}>
                  {/*TABLE1*/}
                  <Table
                    dataSource={this.state.class1_students}
                    columns={this.tableColumns}
                    rowSelection={{
                      columnWidth: 24,
                      selectedRowKeys: this.state.class1_movingStudents,
                      onChange: (selectedRowKeys) => {this.setState({class1_movingStudents: selectedRowKeys})}
                    }}
                    scroll={{x: 700, y: 326}}
                    size="small"
                    pagination={false}
                  />
                </div>
              </div>
              {/*TRANSFER BUTTONS (MIDDLE)*/}
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{width: '65px', marginTop: '265px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                  <Button
                    color="normal" style={{margin: '8px'}} disabled={this.state.class1_info.classID === 0 || this.state.updating}
                    clicked={() => this.updateStudentClassHandler(this.state.class2_movingStudents, this.state.class1_info.classID)}
                  >{"<"}</Button>
                  <Button
                    color="normal" style={{margin: '8px'}} disabled={this.state.class2_info.classID === 0 || this.state.updating}
                    clicked={() => this.updateStudentClassHandler(this.state.class1_movingStudents, this.state.class2_info.classID)}
                  >{">"}</Button>
                </div>
              </div>
              {/*RIGHT PANEL*/}
              <div style={{width: 'calc(50vw - 210px)'}}>
                <div className={styles.FilterWrapper} style={{marginBottom: '16px'}}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{width: '34px', margin: '0 16px 0 0'}}><b>Class:</b></span>
                    <span style={{width: '116px', margin: '0 16px 0 0'}}>
                      {this.state.class2_info.classID === 0 ? this.state.class2_info.name :
                      this.state.class2_info.name+` (${this.state.class2_info.year}-${this.state.class2_info.year-1+2})`}
                    </span>
                    <Button color="normal" clicked={() => {this.setState({isPickingClass2: true})}}>Choose...</Button>
                  </div>
                </div>
                <div className={styles.FilterWrapper} >
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{width: '100px'}}>Class Name:</span>
                    <Input
                      className={styles.FilterInput}
                      value={this.state.class2_info ? this.state.class2_info.name : ""}
                      onChange={e => this.modelOnChangeHandler(e, 'name', 2)}
                      onBlur={() => this.updateClassHandler(2)}
                      disabled={this.state.class2_info.classID === 0}
                    />
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{width: '100px'}}>Head Teacher:</span>
                    <Select
                      className={styles.FilterSelect}
                      value={this.state.class2_info.headTeacherID}
                      onChange={e => this.modelOnChangeHandler(e, 'headTeacherID', 2)}
                      onBlur={() => this.updateClassHandler(2)}
                      disabled={this.state.class2_info.classID === 0}
                    >
                      <Option value={null}>None</Option>
                      {this.state.teachers.map(t => (
                        <Option key={t.teacherID} value={t.teacherID}>
                          {t.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div style={{
                  height: 'calc(100vh - 529px)',
                  marginTop: '16px',
                  border: 'thin solid #e8e8e8',
                  borderRadius: '4px'
                }}>
                  {/*TABLE2*/}
                  <Table
                    dataSource={this.state.class2_students}
                    columns={this.tableColumns}
                    rowSelection={{
                      columnWidth: 24,
                      selectedRowKeys: this.state.class2_movingStudents,
                      onChange: (selectedRowKeys) => {this.setState({class2_movingStudents: selectedRowKeys})}
                    }}
                    scroll={{x: 700, y: 326}}
                    size="small"
                    pagination={false}
                  />
                </div>
              </div>
            </Card>
          </div>
        }
      </Fragment>
    );
  }
}

export default ClassManager;
