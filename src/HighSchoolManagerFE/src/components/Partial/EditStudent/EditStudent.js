import React, {Component} from 'react';
import {Input, Radio, DatePicker, Popconfirm, message} from 'antd';
import moment from 'moment';
import styles from './EditStudent.module.css';

import AuthRoute from '../../../hoc/AuthRoute/AuthRoute';
import Request from '../../../common/commonRequest';
import Validation from '../../../common/commonValidation';

import Button from '../../UI/Button/Button';
import Modal from '../../UI/Modal/Modal';
import LoadScreen from '../../UI/LoadScreen/LoadScreen';
import InvalidBox from '../InvalidBox/InvalidBox';

class EditStudent extends Component {
  state = {
    editingStudentID: null,
    editingStudent: {},

    loading: true,
    initForm: false,
    submittingForm: false,
    invalidFields: [],
  }

  formFields = {
    lastName: {
      event: {},
      label: 'Last Name',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
    firstName: {
      event: {},
      label: 'First Name',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
    gender: {
      event: {},
      label: 'Gender',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
    birthday: {
      event: {},
      label: 'Date of Birth',
      validates: [
        {name: 'NotNull', params: []},
        {name: 'FromYearsOld', params: [14]},
        {name: 'ToYearsOld', params: [18]},
      ],
      errorMessage: '',
    },
    address: {
      event: {},
      label: 'Address',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
  };

  formOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    this.setState(prevState => {
      let newStudent = {...prevState.editingStudent};
      newStudent[key] = value;
      return {editingStudent: newStudent};
    });
  };

  validateFieldOnBlurHandler = (event, key) => {
    let _invalidFields = [...this.state.invalidFields].filter(fieldId => fieldId !== key);
    const value = event ? (event.target ? event.target.value : event) : null;
    if (!Validation.validateField(this.formFields, key, value)) {
      _invalidFields.push(key);
    }
    this.setState({invalidFields: _invalidFields});
  }

  submitFormHandler = () => {
    if (!this.validateForm(this.formFields, 'invalidFields', this)) {
      message.error('Editing student failed. Check for invalid fields');
      return;
    }
    const newStudent = {...this.state.editingStudent};
    newStudent.studentID = undefined;
    newStudent.birthday = newStudent.birthday.format('YYYY-MM-DD');

    this.setState({submittingForm: true});
    const reqMessage = message.loading('Submitting', 9000);
    Request.put(
      '/Student/Edit?studentID='+this.props.studentID,
      newStudent,
      "cred",
      response => {
        setTimeout(reqMessage, 0);
        message.success('Editing student successfully');
        console.log('POST SUCCESSFUL!', response);
        this.setState({submittingForm: false});
      },
      error => {
        setTimeout(reqMessage, 0);
        message.error('Editing student failed');
        console.log('PUT UNSUCCESSFUL :(', error.response);
        this.setState({submittingForm: false});
      },
    );
  }

  deleteStudentHandler = () => {
    this.setState({submittingForm: true});
    const reqMessage = message.loading('Submitting', 9000);
    Request.delete('/Student/Delete?studentID='+this.props.studentID, 'cred', () => {
      setTimeout(reqMessage, 0);
      message.success('Deleting student successfully');
      this.setState({submittingForm: false});
      this.props.finish();
    }, error => {
      setTimeout(reqMessage, 0);
      message.error('Deleting student failed');
      console.log('DELETE UNSUCCESSFUL :(', error.response);
      this.setState({submittingForm: false});
    });
  }

  async fetchStudent() {
    await Request.get('/Student/Get?studentID='+this.props.studentID, 'cred', response => {
      let _student = response.data;
      let newStudent = {};
      newStudent.lastName = _student.lastName;
      newStudent.firstName = _student.firstName;
      newStudent.gender = _student.gender;
      newStudent.birthday = moment(_student.birthday, 'YYYY/MM/DD');
      newStudent.enrollDate = _student.enrollDate;
      newStudent.address = _student.address;
      newStudent.classID = _student.classID;
      this.setState({editingStudent: newStudent});
    }, () => {
      this.props.history.replace('/Student');
    });
  }

  constructor(props) {
    super(props);
    Validation.initFormFields(this.formFields);
  }

  async componentDidMount() {
    this.validateForm = Validation.validateForm;
    this.setState({editingStudentID: this.props.studentID});
    await this.fetchStudent();
    this.setState({loading: false});
  }

  componentDidUpdate() {
    if (!this.state.loading && !this.state.initForm) {
      // Focus 1st input
      //this.formFields.lastName.event.current.focus();
      this.setState({initForm: true});
    }
    if (this.props.studentID !== this.state.editingStudentID)
      this.setState({editingStudentID: this.props.studentID});
  }

  render() {
    const inputMargin = {margin: '0 16px'};
    const inputWidth = {width: '200px'};
    const spanWidth = {display: 'inline-block', width: '100px'};
    const errorProps = Validation.getErrorProps(this.formFields, this.state.invalidFields);

    return (
      <Modal modalClosed={this.props.finish}>
        <AuthRoute roles={['Manager']}>
          <h1>Edit Student</h1>
          <hr />
          {this.state.loading ? <LoadScreen /> :
            <div className={styles.EditStudent}>
              <div className={styles.FormWrapper} style={{width: '100%', marginTop: '16px'}}>
                <div className={styles.FieldWrapper}>
                  <span style={{...inputMargin, ...spanWidth}}>{this.formFields['lastName'].label}:</span>
                  <Input
                    style={{...inputMargin, ...inputWidth, ...errorProps.lastName.style}}
                    ref={this.formFields.lastName.event}
                    value={this.state.editingStudent.lastName}
                    onChange={e => {this.formOnChangeHandler(e, 'lastName')}}
                    onBlur={e => this.validateFieldOnBlurHandler(e, 'lastName')}
                  />
                  <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.lastName.message}</InvalidBox>
                </div>
                <div className={styles.FieldWrapper}>
                  <span style={{...inputMargin, ...spanWidth}}>{this.formFields['firstName'].label}:</span>
                  <Input
                    style={{...inputMargin, ...inputWidth, ...errorProps.firstName.style}}
                    ref={this.formFields.firstName.event}
                    value={this.state.editingStudent.firstName}
                    onChange={e => this.formOnChangeHandler(e, 'firstName')}
                    onBlur={e => this.validateFieldOnBlurHandler(e, 'firstName')}
                  />
                  <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.firstName.message}</InvalidBox>
                </div>
                <div className={styles.FieldWrapper}>
                  <span style={{...inputMargin, ...spanWidth}}>{this.formFields['gender'].label}:</span>
                  <Radio.Group
                    value={this.state.editingStudent.gender}
                    ref={this.formFields.gender.event}
                    onChange={e => {this.formOnChangeHandler(e, 'gender'); this.validateFieldOnBlurHandler(e, 'gender');}}
                  >
                    <Radio style={inputMargin} value="Male" >
                      Male
                    </Radio>
                    <Radio style={inputMargin} value="Female">
                      Female
                    </Radio>
                  </Radio.Group>
                  <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.gender.message}</InvalidBox>
                </div>
                <div className={styles.FieldWrapper}>
                  <span style={{...inputMargin, ...spanWidth}}>{this.formFields['birthday'].label}:</span>
                  <DatePicker
                    style={{...inputMargin, ...inputWidth, ...errorProps.birthday.style}}
                    ref={this.formFields.birthday.event}
                    value={this.state.editingStudent.birthday}
                    onChange={e => {this.formOnChangeHandler(e, 'birthday'); this.validateFieldOnBlurHandler(e, 'birthday');}}
                  />
                  <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.birthday.message}</InvalidBox>
                </div>
                <div className={styles.FieldWrapper}>
                  <span style={{...inputMargin, ...spanWidth}}>{this.formFields['address'].label}:</span>
                  <Input
                    style={{...inputMargin, ...inputWidth, ...errorProps.address.style}}
                    ref={this.formFields.address.event}
                    value={this.state.editingStudent.address}
                    onChange={e => this.formOnChangeHandler(e, 'address')}
                    onBlur={e => this.validateFieldOnBlurHandler(e, 'address')}
                  />
                  <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.address.message}</InvalidBox>
                </div>
                <div
                  className={styles.FieldWrapper}
                  style={{display: 'flex', justifyContent: 'center'}}>
                  <Button style={{marginLeft: '143px'}} color="success" clicked={this.submitFormHandler} disabled={this.state.submittingForm}>Update</Button>
                  <Popconfirm
                    title="Are you sure wanted to delete this student?"
                    okText="Yes"
                    cancelText="No"
                    placement="topRight"
                    onConfirm={this.deleteStudentHandler}
                  >
                    <div style={{alignSelf: 'center'}}>
                      <Button style={{marginLeft: '60px', fontSize: '10px', padding: '0.25rem'}}
                        color="danger" clicked={() => {}} disabled={this.state.submittingForm}
                      >
                        Delete
                      </Button>
                    </div>
                  </Popconfirm>
                </div>
              </div>
            </div>
          }
        </AuthRoute>
      </Modal>
    );
  }
}

export default EditStudent;
