import React, {Component, Fragment} from 'react';
import {Input, Radio, DatePicker, message} from 'antd';

import Request from '../../../common/commonRequest';
import Validation from '../../../common/commonValidation';

import styles from './AddStudent.module.css';
import LoadScreen from '../../../components/UI/LoadScreen/LoadScreen';
import Card from '../../../components/UI/Card/Card';
import Button from '../../../components/UI/Button/Button';
import InvalidBox from '../../../components/Partial/InvalidBox/InvalidBox';

class AddStudent extends Component {
  state = {
    loading: true,
    initForm: false,
    submittingForm: false,
    addingStudent: {},
    invalidFields: [],
  };

  // inputs event are assigned at render()
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

  constructor(props) {
    super(props);
    Validation.initFormFields(this.formFields);
  }

  componentDidMount() {
    this.setState({loading: false});
    this.setState({addingStudent: {gender: 'Male'}});
    this.validateForm = Validation.validateForm;
  }

  componentDidUpdate() {
    if (!this.state.loading && !this.state.initForm) {
      // Focus 1st input
      this.formFields.lastName.event.current.focus();
      this.setState({initForm: true});
    }
  }

  formOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    this.setState(prevState => {
      let newStudent = {...prevState.addingStudent};
      newStudent[key] = value;
      return {addingStudent: newStudent};
    });
  };

  // run on onBlur
  validateFieldOnBlurHandler = (event, key) => {
    let _invalidFields = [...this.state.invalidFields].filter(fieldId => fieldId !== key);
    const value = event ? (event.target ? event.target.value : event) : null;
    //if (!Validation.validate_NotNull(event.target.value)) {
    if (!Validation.validateField(this.formFields, key, value)) {
      _invalidFields.push(key);
    }
    this.setState({invalidFields: _invalidFields});
  }

  submitFormHandler = () => {
    if (!this.validateForm(this.formFields, 'invalidFields', this)) {
      message.error('Add student failed. Check for invalid fields');
      return;
    }
    const newStudent = {...this.state.addingStudent};
    newStudent.birthday = newStudent.birthday.format('YYYY-MM-DD');

    this.setState({submittingForm: true});
    const reqMessage = message.loading('Submitting', 9000);
    Request.post(
      '/Student/Create',
      newStudent,
      "cred",
      response => {
        setTimeout(reqMessage, 0);
        message.success('Added student successfully');
        console.log('POST SUCCESSFUL!', response);
        this.setState({addingStudent: {}});
        this.setState({submittingForm: false});
        this.setState({addingStudent: {gender: 'Male'}});
        this.formFields.lastName.event.current.focus();
      },
      error => {
        setTimeout(reqMessage, 0);
        message.error('Added student failed');
        console.log('POST UNSUCCESSFUL :(', error.response);
        this.setState({submittingForm: false});
      },
    );
  }

  render() {
    const inputMargin = {margin: '0 16px'};
    const inputWidth = {width: '200px'};
    const spanWidth = {display: 'inline-block', width: '100px'};
    const errorProps = Validation.getErrorProps(this.formFields, this.state.invalidFields);

    return (
      <Fragment>
        {this.state.loading ? (
          <LoadScreen style={{position: 'fixed', top: '64px', left: '225px'}} />
        ) : (
          <div className={styles.AddStudent}>
            <h1>Add Student</h1>
            <p>Add a new student to school</p>
            <Card
              style={{
                height: 'calc(100vh - 232px)',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <div className={styles.FormWrapper}>
                <div className={styles.FieldWrapper}>
                  <span style={{...inputMargin, ...spanWidth}}>{this.formFields['lastName'].label}:</span>
                  <Input
                    style={{...inputMargin, ...inputWidth, ...errorProps.lastName.style}}
                    ref={this.formFields.lastName.event}
                    value={this.state.addingStudent.lastName}
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
                    value={this.state.addingStudent.firstName}
                    onChange={e => this.formOnChangeHandler(e, 'firstName')}
                    onBlur={e => this.validateFieldOnBlurHandler(e, 'firstName')}
                  />
                  <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.firstName.message}</InvalidBox>
                </div>
                <div className={styles.FieldWrapper}>
                  <span style={{...inputMargin, ...spanWidth}}>{this.formFields['gender'].label}:</span>
                  <Radio.Group
                    value={this.state.addingStudent.gender}
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
                    value={this.state.addingStudent.birthday}
                    onChange={e => {this.formOnChangeHandler(e, 'birthday'); this.validateFieldOnBlurHandler(e, 'birthday');}}
                  />
                  <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.birthday.message}</InvalidBox>
                </div>
                <div className={styles.FieldWrapper}>
                  <span style={{...inputMargin, ...spanWidth}}>{this.formFields['address'].label}:</span>
                  <Input
                    style={{...inputMargin, ...inputWidth, ...errorProps.address.style}}
                    ref={this.formFields.address.event}
                    value={this.state.addingStudent.address}
                    onChange={e => this.formOnChangeHandler(e, 'address')}
                    onBlur={e => this.validateFieldOnBlurHandler(e, 'address')}
                  />
                  <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.address.message}</InvalidBox>
                </div>
                <div
                  className={styles.FieldWrapper}
                  style={{display: 'flex', justifyContent: 'center'}}>
                  <Button color="success" clicked={this.submitFormHandler} disabled={this.state.submittingForm}>Add</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Fragment>
    );
  }
}

export default AddStudent;
