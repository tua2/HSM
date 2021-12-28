import React, {Component, Fragment} from 'react';
import {Table, Input, InputNumber, Select, Popconfirm, Steps, Icon, Result, message} from 'antd';
import styles from './CreateClass.module.css';

import Request from '../../../../common/commonRequest';
import Validation from '../../../../common/commonValidation';
import Params from '../../../../common/commonParams';
import Button from '../../../../components/UI/Button/Button';
import InvalidBox from '../../../../components/Partial/InvalidBox/InvalidBox';
import LoadScreen from '../../../../components/UI/LoadScreen/LoadScreen';

const {Option} = Select;
const {Step} = Steps;

class CreateClass extends Component {
  state = {
    loading: true,
    step: 1,
    step1_grades: [],
    step1_additionalInfos: {
      availableStudents: null,
      existingClasses: null,
    },
    step1_updating: false,
    invalidFields1: [],
    // ---
    step2_studentsList: [],
    step2_teachersList: [],
    step2_currentClass: 0,
    // step2_addingStudents: [1, 2, 4]
    step2_addingStudents: [],
    // step2_removingStudents: [[1, 2], [3, 5], [7, 8]]
    step2_removingStudents: [],
    step2_isInvalid: false,
    classModel: {
      year: null,
      gradeID: null,
      quantity: null,
      // classes: [{name: '', teacherID: '', students: []}]
      classes: [],
    },
  }
  constructor(props) {
    super(props);
    this.currentDate = new Date();
    this.state.classModel.year = this.currentDate.getFullYear();
    this.state.classModel.gradeID = 1;
    Validation.initFormFields(this.formFields1);
  }

  formFields1 = {
    gradeID: {
      event: {},
      label: 'Grade',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
    quantity: {
      event: {},
      label: 'Quantity',
      validates: [
        {name: 'NotNull', params: []},
        {name: 'Int', params: []},
        {name: 'RangeFrom', params: [1]},
        {name: 'RangeTo', params: [20]}
      ],
      errorMessage: '',
    },
  };

  getPreviousYear() {
    return (this.state.years.length > 1) ? [...this.state.years].reverse()[1] : this.state.classModel.year-1;
  }

  form1OnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let newModel = {...this.state.classModel};
    newModel[key] = value;
    //this.setState(prevState => {
      //return {classModel: newModel, step1_updating: true};
    //});
    if (key === "gradeID")
      this.setState({step1_updating: true});
    this.setState({classModel: newModel});
  };

  async fetchGrades() {
    await Request.get('/Grade/Get', 'cred', response => {
      let _grades = response.data;
      this.setState({step1_grades: _grades});
    });
  }

  async fetchAdditionalInfos() {
    let _additionalInfo = {...this.state.additionalInfos}
    let searchParams = "";
    //Available students
    let _availableStudents = null;
    switch (this.state.classModel.gradeID) {
      // grade 10
      case 1: {
        await Request.get('/Student/Get?classid=0', 'cred', response => {
          _availableStudents = response.data.length;
          _additionalInfo['availableStudents'] = _availableStudents;
          this.setState({step1_additionalInfos: _availableStudents});
        });
        break;
      }
      // grade 11 & 12
      case 2:
      case 3: {
        let _availableStudents = 0;
        await Request.get('/Student/Get?classid=0', 'cred', response => {
          _availableStudents += response.data.length;
          _additionalInfo['availableStudents'] = _availableStudents;
          this.setState({step1_additionalInfos: _availableStudents});
        });
        await Request.get(`/Student/Get?gradeid=${this.state.classModel.gradeID-1}&year=${this.getPreviousYear()}`, 'cred', response => {
          _availableStudents += response.data.length;
          _additionalInfo['availableStudents'] = _availableStudents;
          this.setState({step1_additionalInfos: _availableStudents});
        });
        break;
      }
      default:
        break;
    }

    //Existing classes
    let _existingClasses = null;
    searchParams = Params.getSearchParamsFromObj(this.state.classModel, ['gradeID', 'year']);
    await Request.get('/Class/Get?'+searchParams, 'cred', response => {
      _existingClasses = response.data.length;
      _additionalInfo['existingClasses'] = _existingClasses;
      this.setState({step1_additionalInfos: _additionalInfo});
    });
  }

  async fetchStudents() {
    let studentsList = [];
    //grade 10 (new students) VS grade 11, 12 (old students)
    await Request.get('Student/Get?classid=0', 'cred', response => {
      const newStudentsList = response.data.map(s => {
        return {
          ...s,
          key: s.studentID,
        };
      });
      studentsList = [...newStudentsList];
    });
    if (this.state.classModel.gradeID !== 1) {
      const searchParams = `gradeID=${parseInt(this.state.classModel.gradeID)-1}&year=${this.getPreviousYear()}`;
      await Request.get('Student/Get?'+searchParams, 'cred', response => {
        const newStudentsList2 = response.data.map(s => {
          return {
            ...s,
            key: s.studentID,
          };
        });
        studentsList = [...newStudentsList2, ...studentsList];
      });
    }
    this.setState({step2_studentsList: studentsList});
  }

  async fetchTeachers() {
    await Request.get('/Teacher/Get', 'cred', response => {
      const teachers = response.data;
      let acceptedTeachers = [];
      // Only accept teacher with no class
      teachers.forEach(async (t) => {
        await Request.get('/Class/Get?headTeacherID='+t.teacherID, 'cred', response => {
          if (response.data.length <= 0) {
            acceptedTeachers.push(t);
            this.setState({step2_teachersList: acceptedTeachers});
          }
        });
      });
      //this.setState({step2_teachersList: acceptedTeachers});
    });
  }

  async fetchYears() {
    let newYears = [];
    await Request.get('/Semester/Get', 'cred', response => {
      newYears = response.data.map(s => s.year);
      newYears = newYears.filter((y, index, self) => self.indexOf(y) === index);
      let newModel = {...this.state.classModel};
      newModel.year = [...newYears].reverse()[0];
      this.setState({years: newYears, classModel: newModel});
    });
  }

  validateField1OnBlurHandler = (event, key) => {
    let _invalidFields = [...this.state.invalidFields1].filter(fieldId => fieldId !== key);
    const value = event ? (event.target ? event.target.value : event) : null;
    if (!Validation.validateField(this.formFields1, key, value)) {
      _invalidFields.push(key);
    }
    this.setState({invalidFields1: _invalidFields});
  }

  submitForm1Handler = async () => {
    if (!this.validateForm(this.formFields1, 'invalidFields1', this)) {
      message.error('Create new classes failed. Check for invalid fields');
      return;
    }
    // STEP 2 INITIALIZER
    this.setState(prevState => {
      let newModel = {...prevState.classModel};
      newModel.quantity = parseInt(newModel.quantity);
      let chosenStudentsArr = [];
      let classNameDivider = "/";
      switch (prevState.classModel.gradeID) {
        case 1:
          classNameDivider = "C";
          break;
        case 2:
          classNameDivider = "B";
          break;
        case 3:
          classNameDivider = "A";
          break;
        default:
          break;
      }
      for (let i=0; i<prevState.classModel.quantity; i++) {
        chosenStudentsArr.push({
          name: this.state.step1_grades.filter(g => g.gradeID === prevState.classModel.gradeID)[0].name +
            classNameDivider +
            (parseInt(prevState.step1_additionalInfos.existingClasses)+i+1),
          teacherID: null,
          students: []});
      }
      newModel = {...newModel, classes: chosenStudentsArr};
      return {classModel: newModel};
    });
    let removingStudentsArr = [];
    for (let i=0; i<parseInt(this.state.classModel.quantity); i++) {
      removingStudentsArr.push([]);
    }
    this.setState({step2_removingStudents: removingStudentsArr});

    this.setState({loading: true, step: 2});
    await Promise.all([this.fetchStudents(), this.fetchTeachers()]);
    this.setState({loading: false});
  }

  // ------------------ STEP 2

  addStudentsToClassHandler = (e, classIndex) => {
    const currentStudentsList = [...this.state.step2_studentsList];
    const alteredCurrentStudentsIDList = [...currentStudentsList.map(s => s.studentID).filter(sID => !this.state.step2_addingStudents.includes(sID))];
    const addingStudentsIDList = [...currentStudentsList.map(s => s.studentID).filter(sID => this.state.step2_addingStudents.includes(sID))];
    // DEEP COPY
    const newModel = JSON.parse(JSON.stringify(this.state.classModel));
    newModel.classes[classIndex].students = [
      ...newModel.classes[classIndex].students,
      ...currentStudentsList.filter(s => addingStudentsIDList.includes(s.studentID))
    ];
    if (newModel.classes[classIndex].students.length > 40) {
      message.error("Class size cannot be higher than 40");
      return;
    }
    else {
      this.setState({
        classModel: newModel,
        step2_studentsList: currentStudentsList.filter(s => alteredCurrentStudentsIDList.includes(s.studentID)),
        step2_addingStudents: [],
      });
    }
  }

  removeStudentsFromClassHandler = (e, classIndex) => {
    const addedStudentsList = [...this.state.classModel.classes[classIndex].students];
    const alteredAddedStudentsIDList = [...addedStudentsList.map(s => s.studentID).filter(sID => !this.state.step2_removingStudents[classIndex].includes(sID))];
    const removingStudentsIDList = [...addedStudentsList.map(s => s.studentID).filter(sID => this.state.step2_removingStudents[classIndex].includes(sID))];
    const studentsList = [
      ...this.state.step2_studentsList,
      ...addedStudentsList.filter(s => removingStudentsIDList.includes(s.studentID))
    ];
    // DEEP COPY
    const newModel = JSON.parse(JSON.stringify(this.state.classModel));
    newModel.classes[classIndex].students = addedStudentsList.filter(s => alteredAddedStudentsIDList.includes(s.studentID));
    let _step2_removingStudents = [...this.state.step2_removingStudents];
    _step2_removingStudents[classIndex] = [];
    this.setState({
      classModel: newModel,
      step2_studentsList: studentsList,
      step2_removingStudents: _step2_removingStudents,
    });
  }

  submitForm2Handler = async () => {
    // Check if classes' headTeachers are the same
    let teacherIDs = this.state.step2_teachersList.map(t => t.teacherID);
    let existSameTeacher = false;
    teacherIDs.forEach(tID => {
      if (this.state.classModel.classes.filter(c => c.teacherID === tID).length > 1) {
        message.error("Classes cannot have the same teacher");
        existSameTeacher = true;
        return;
      }
    });
    // Check if classes' names are the same
    let distinctNames = JSON.parse(JSON.stringify(this.state.classModel)).classes
      .map(c => c.name)
      .filter((y, index, self) => self.indexOf(y) === index);
    let existSameName = false;
    distinctNames.forEach((_name) => {
      if (this.state.classModel.classes.filter(c => c.name === _name).length > 1) {
        message.error("Classes cannot have the same name");
        existSameName = true;
        return;
      }
    });
    this.setState({step2_isInvalid: false});
    if (existSameTeacher || existSameName)
      return;

    this.setState({loading: true});
    for (let c of this.state.classModel.classes) {
      await Request.post('/Class/Create', {
        name: c.name,
        year: this.state.classModel.year,
        gradeID: this.state.classModel.gradeID,
        headTeacherID: c.teacherID ? c.teacherID : null,
      }, 'cred', async (response) => {
        await Request.put('/Class/AddStudentsToClass?classID='+response.data.classID, {ids: c.students.map(s => s.studentID)}, 'cred', () => {
          this.setState({loading: false, step: 3});
        },
          error2 => {
            this.setState({loading: false, step: 1});
            Request.showError(error2);
            console.log(error2.response)
          }
        );
      },
        error => {
          this.setState({loading: false});
          Request.showError(error);
          console.log(error.response)
        }
      );
    };
  }

  async componentDidMount() {
    this.validateForm = Validation.validateForm;
    await Promise.all([this.fetchGrades(), this.fetchYears(), this.fetchAdditionalInfos()]);
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.step1_updating) {
      await Promise.all([this.fetchAdditionalInfos()]);
      this.setState({step1_updating: false});
    }
    if (this.state.step === 2 && !this.props.creating)
      this.props.changeState(true);
    else if (this.state.step !== 2 && this.props.creating)
      this.props.changeState(false);
  }

  render() {
    const inputMargin = {margin: '0 16px'};
    const inputMarginSibling = {margin: '8px 16px 0'};
    const inputWidth = {width: '200px'};
    const spanWidth = {display: 'inline-block', width: '100px'};
    const spanWidthBig = {display: 'inline-block', width: '200px'};
    const errorProps1 = Validation.getErrorProps(this.formFields1, this.state.invalidFields1);

    return(
      <Fragment>
        <h1>Creating Class Wizard</h1>
        <hr />
        <div style={{padding: '14px 100px'}}>
          <Steps current={this.state.step-1} size="small">
            <Step title="Grade & Quantity" />
            <Step title="Info & Students" />
            <Step title="Done" icon={<Icon type="smile-o" />}/>
          </Steps>
        </div>
        <div className={styles.CreateClass}>
          {/* STEP 1*/}
          {this.state.step !== 1 ? null : (this.state.loading ? <LoadScreen /> : 
            <div className={[styles.FormWrapper, styles.WizardWrapper].join(' ')}>
              <div className={styles.FieldWrapper}>
                <span style={{...inputMargin, ...spanWidth}}>Year:</span>
                <Input style={{...inputMargin, ...inputWidth}} value={this.state.classModel.year+'-'+parseInt(this.state.classModel.year+1)} disabled />
              </div>
              <div className={styles.FieldWrapper}>
                <span style={{...inputMarginSibling, ...spanWidth}}>{this.formFields1['gradeID'].label}:</span>
                <Select 
                  style={{...inputMarginSibling, ...inputWidth, ...errorProps1.gradeID.style}}
                  placeholder="Select grade"
                  ref={this.formFields1.gradeID.event}
                  value={this.state.classModel.gradeID}
                  onChange={e => {this.form1OnChangeHandler(e, 'gradeID'); this.validateField1OnBlurHandler(e, 'gradeID')}}
                >
                    {this.state.step1_grades.map(e => {
                      return (
                        <Option key={`gradeSelect-${e.gradeID}`} value={e.gradeID}>
                          {e.name}
                        </Option>
                      );
                    })}
                </Select>
                <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps1.gradeID.message}</InvalidBox>
                <span style={{...inputMarginSibling, ...spanWidth}}>&nbsp;</span>
                <span style={{...inputMarginSibling, ...spanWidthBig}}>
                  <b>Available students: </b>{(this.state.step1_additionalInfos.availableStudents!==null || this.state.loading) ?
                    this.state.step1_additionalInfos.availableStudents : '...'}
                </span>
                <span style={{...inputMarginSibling, ...spanWidth}}>&nbsp;</span>
                <span style={{...inputMarginSibling, ...spanWidthBig}}>
                  <b>Existing classes: </b>{(this.state.step1_additionalInfos.existingClasses!==null || this.state.loading) ?
                    this.state.step1_additionalInfos.existingClasses : '...'}
                </span>
              </div>
              <div className={styles.FieldWrapper}>
                <span style={{...inputMarginSibling, ...spanWidth}}>{this.formFields1['quantity'].label}:</span>
                <InputNumber
                  style={{...inputMarginSibling, ...inputWidth, ...errorProps1.quantity.style}}
                  ref={this.formFields1.quantity.event}
                  value={this.state.classModel.quantity}
                  onChange={e => this.form1OnChangeHandler(e, 'quantity')}
                  onBlur={e => this.validateField1OnBlurHandler(e, 'quantity')}
                />
                <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps1.quantity.message}</InvalidBox>
              </div>
              <div
                className={styles.FieldWrapper}
                style={{display: 'flex', justifyContent: 'center'}}>
                <Button color="primary" clicked={this.submitForm1Handler} disabled={this.state.step1_updating}>Continue</Button>
              </div>
            </div>
          )}
          {/* STEP 2 */}
          {this.state.step !== 2 ? null : (this.state.loading ? <LoadScreen /> :
            <Fragment>
              <div style={{width: '100%'}} className={styles.WizardWrapper}>
                <div style={{width: '100%', margin: '0 0 16px', display: 'flex', overflowX: 'auto'}}>
                  {this.state.classModel.classes.map((c, index) => {
                    return (
                      <Button
                        key={`classBtn-${index}`}
                        color="normal"
                        style={{margin: '0 8px 0 0'}}
                        disabled={this.state.step2_currentClass === index}
                        clicked={() => {
                          this.setState({step2_currentClass: index});
                        }}
                      >
                        {c.name}
                      </Button>
                    );
                  })}
                </div>
                <div style={{width: '100%', margin: '0 0 16px', display: 'flex'}}>
                  <div style={{width: '492px'}}>
                    <span style={{margin: '0 8px 0 0', width: '50px'}}>Name:</span>
                    <Input
                      style={{...inputMargin, width: '75px'}}
                      value={this.state.classModel.classes[this.state.step2_currentClass].name}
                      onChange={e => {
                        let value = this.state.step1_grades.filter(g => g.gradeID === this.state.classModel.gradeID)[0].name+"/?";
                        if (e.target.value)
                          value = e.target.value;
                        this.setState(prevState => {
                          const newModel = {...prevState.classModel};
                          newModel.classes[prevState.step2_currentClass].name = value;
                          return {classModel: newModel};
                        })
                      }}
                    />
                    <span style={{margin: '0 8px 0 32px', width: '75px'}}>Head Teacher:</span>
                    <Select
                      style={{margin: '0 0 0 16px', width: '191px'}}
                      value={this.state.classModel.classes[this.state.step2_currentClass].teacherID}
                      onChange={e => {
                        let value = e;
                        this.setState(prevState => {
                          const newModel = {...prevState.classModel};
                          newModel.classes[prevState.step2_currentClass].teacherID = value;
                          return {classModel: newModel};
                        })
                      }}
                    >
                      <Option value={null}>None</Option>
                      {this.state.step2_teachersList.map(t => (
                        <Option key={`teacherSelect-${t.teacherID}`} value={t.teacherID}>
                          {t.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                    <div style={{marginLeft: '56px', display: 'flex', alignItems: 'center'}}>
                    <b>
                      {this.state.classModel.gradeID === 1 ?
                        "Students with no class" :
                        `Students of Grade ${this.state.step1_grades.filter(g => g.gradeID === this.state.classModel.gradeID-1)[0].name}, Previous Year (${this.getPreviousYear()}-${this.getPreviousYear()+1})`}
                    </b>
                  </div>
                </div>
              </div>
              <div className={[styles.SplitWrapper, styles.WizardWrapper].join(' ')} style={{margin: '0 0 16px 0'}}>
                <div style={{
                  width: '489px',
                  border: 'thin solid #e8e8e8',
                  borderRadius: '4px'
                }}>
                  {/* new classes, with to-be-added students */}
                  <Table
                    columns={[
                      {
                        title: 'Old Class',
                        render: (text, record, index) => record.class?record.class.name:<i>None</i>,
                        width: 100,
                      },
                      {title: 'Last Name', dataIndex: 'lastName', width: 193, sorter: (a,b) => a.lastName.localeCompare(b.lastName), sortDirections: ['ascend', 'descend']},
                      {title: 'First Name', dataIndex: 'firstName', width: 173, sorter: (a,b) => a.firstName.localeCompare(b.firstName), sortDirections: ['ascend', 'descend']},
                    ]}
                    rowSelection={{
                      columnWidth: 24,
                      selectedRowKeys: this.state.step2_removingStudents[this.state.step2_currentClass],
                      onChange: (selectedRowKeys) => {
                        const selectedStudents = selectedRowKeys;
                          let removingStudentsArr = [...this.state.step2_removingStudents];
                          removingStudentsArr[this.state.step2_currentClass] = selectedStudents;
                        this.setState({step2_removingStudents: removingStudentsArr}
                        );
                      },
                      getCheckboxProps: record => ({
                        //disabled: record.name === 'Disabled User', // Column configuration not to be checked
                        name: record.name,
                      }),
                    }}
                    dataSource={this.state.classModel.classes ? this.state.classModel.classes[this.state.step2_currentClass].students : []}
                    scroll={{x: 479, y: 300}}
                    pagination={false}
                    size="small"
                  />
                </div>
                <div className={styles.TransferBtnsWrapper}>
                  <Button color="primary" style={{margin: '8px'}} clicked={e => this.addStudentsToClassHandler(e, this.state.step2_currentClass)}><b>{'<'}</b></Button>
                  <Button color="normal" style={{margin: '8px'}} clicked={e => this.removeStudentsFromClassHandler(e, this.state.step2_currentClass)}>{'>'}</Button>
                </div>
                <div style={{
                  width: '316px',
                  border: 'thin solid #e8e8e8',
                  borderRadius: '4px'
                }}>
                  {/* Pick students to add to classes */}
                  <Table
                    columns={[
                      {
                        title: 'Cls.',
                        render: (text, record, index) => record.class?record.class.name:<i>None</i>,
                        width: 60,
                      },
                      {
                        title: 'Full Name', render: (text, record, index) => <span>{record.lastName} <b>{record.firstName}</b></span>,
                        width: 232,
                        sorter: (a,b) => a.firstName.localeCompare(b.firstName), sortDirections: ['ascend', 'descend']
                      }
                    ]}
                    rowSelection={{
                      columnWidth: 24,
                      selectedRowKeys: this.state.step2_addingStudents,
                      onChange: (selectedRowKeys) => {
                        this.setState({step2_addingStudents: selectedRowKeys});
                      },
                      getCheckboxProps: record => ({
                        //disabled: record.name === 'Disabled User', // Column configuration not to be checked
                        name: record.name,
                      }),
                    }}
                    dataSource={this.state.step2_studentsList}
                    scroll={{x: 306, y: 300}}
                    pagination={false}
                    size="small"
                  />
                </div>
              </div>
              <div style={{marginTop: '16px'}}>
                <Popconfirm
                  visible={this.state.step2_isInvalid}
                  onVisibleChange={visible => {
                    if (!visible)
                      this.setState({step2_isInvalid: true});
                    if (this.state.classModel.classes.filter(c => c.students.length <= 0).length > 0)
                      this.setState({step2_isInvalid: true});
                    else {
                      this.submitForm2Handler();
                    }
                  }}
                  title={<span>Some of the classes you've added have no student. Are you sure wanted to save?<br/>
                    <i>(You can edit classes later via Class Manager)</i></span>}
                  okText="Yes"
                  cancelText="No"
                  onConfirm={this.submitForm2Handler}
                  onCancel={() => {this.setState({step2_isInvalid: false})}}
                >
                  {/*<Button color="success">Save</Button>*/}
                  <a href="./"><Button color="success">Save</Button></a>
                </Popconfirm>
              </div>
            </Fragment>
          )}
          {/* STEP 3 (Finalizing) */}
          {this.state.step !== 3 ? null : (this.state.loading ? <LoadScreen /> :
            <Result
              status="success"
              title="Success!"
              subTitle="Creating classes successfully"
              extra={[
                <Button key="finish" color="primary" clicked={this.props.finish}>Finish</Button>
              ]}
            />
          )}
        </div>
      </Fragment>
    );
  }
}

export default CreateClass;
