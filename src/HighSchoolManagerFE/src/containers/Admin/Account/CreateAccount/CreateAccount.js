import React, {Component, Fragment} from 'react';
import {Input, Radio, DatePicker, message} from 'antd';
import styles from './CreateAccount.module.css';

import Request from '../../../../common/commonRequest';
import Validation from '../../../../common/commonValidation';
import Button from '../../../../components/UI/Button/Button';
import InvalidBox from '../../../../components/Partial/InvalidBox/InvalidBox';
import LoadScreen from '../../../../components/UI/LoadScreen/LoadScreen';

class CreateAccount extends Component {
  state = {
    creatingAccount: {},

    loading: true,
    initForm: false,
    submittingForm: false,
    invalidFields: [],
  }

  formFields = {
    userName: {
      event: {},
      label: 'Username',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
    password: {
      event: {},
      label: 'Password',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
    teacherName: {
      event: {},
      label: 'Full Name',
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
        {name: 'FromYearsOld', params: [22]},
      ],
      errorMessage: '',
    },
  };

  formOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    this.setState(prevState => {
      let newStudent = {...prevState.creatingAccount};
      newStudent[key] = value;
      return {creatingAccount: newStudent};
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

  submitFormHandler = async () => {
    if (!this.validateForm(this.formFields, 'invalidFields', this)) {
      message.error('Creating account failed. Check for invalid fields');
      return;
    }
    this.setState({submittingForm: true});
    const reqMessage = message.loading('Submitting', 9000);
    const creatingAccount = this.state.creatingAccount;
    const newAccount = {
      userName: creatingAccount.userName,
      password: creatingAccount.password,
    };
    const newTeacher = {
      name: creatingAccount.teacherName,
      gender: creatingAccount.gender,
      birthday: creatingAccount.birthday.format('YYYY-MM-DD'),
    };
    await Request.post('/Teacher/Create', newTeacher, 'cred', response => {
      const _teacherID = response.data.teacherID;
      Request.post('/Account/Create', {...newAccount, teacherID: _teacherID}, 'cred',
        () => {
          message.success('Creating account successfully');
          this.props.finish();
        }, error => {
          Request.showDescriptiveError(error, 'messages');
          Request.delete('/Teacher/Delete?teacherID='+_teacherID, 'cred');
        }
      );
    }, error => {
      Request.showDescriptiveError(error);
    });
    setTimeout(reqMessage, 0);
    this.setState({submittingForm: false});
  }


  constructor(props) {
    super(props);
    Validation.initFormFields(this.formFields);
  }

  async componentDidMount() {
    this.validateForm = Validation.validateForm;
    this.setState({loading: false});
  }

  componentDidUpdate() {
    if (!this.state.loading && !this.state.initForm) {
      // Focus 1st input
      this.formFields.userName.event.current.focus();
      this.setState({initForm: true});
    }
  }

  render() {
    const inputMargin = {margin: '0 16px'};
    const inputWidth = {width: '200px'};
    const spanWidth = {display: 'inline-block', width: '100px'};
    const errorProps = Validation.getErrorProps(this.formFields, this.state.invalidFields);

    return (
      <Fragment>
        <h1>Create Account</h1>
        <hr />
        {this.state.loading ? <LoadScreen /> :
          <div className={styles.CreateAccount}>
            <div className={styles.FormWrapper} style={{width: '100%', marginTop: '16px'}}>
              <div className={styles.FieldWrapper}>
                <span style={{...inputMargin, ...spanWidth}}>{this.formFields['userName'].label}:</span>
                <Input
                  style={{...inputMargin, ...inputWidth, ...errorProps.userName.style}}
                  ref={this.formFields.userName.event}
                  value={this.state.creatingAccount.userName}
                  onChange={e => {this.formOnChangeHandler(e, 'userName')}}
                  onBlur={e => this.validateFieldOnBlurHandler(e, 'userName')}
                />
                <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.userName.message}</InvalidBox>
              </div>
              <div className={styles.FieldWrapper}>
                <span style={{...inputMargin, ...spanWidth}}>{this.formFields['password'].label}:</span>
                <Input.Password
                  style={{...inputMargin, ...inputWidth, ...errorProps.password.style}}
                  ref={this.formFields.password.event}
                  value={this.state.creatingAccount.password}
                  onChange={e => {this.formOnChangeHandler(e, 'password')}}
                  onBlur={e => this.validateFieldOnBlurHandler(e, 'password')}
                />
                <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.password.message}</InvalidBox>
              </div>
              <hr style={{width: '256px', marginBottom: '32px'}} />
              <div className={styles.FieldWrapper}>
                <span style={{...inputMargin, ...spanWidth}}>{this.formFields['teacherName'].label}:</span>
                <Input
                  style={{...inputMargin, ...inputWidth, ...errorProps.teacherName.style}}
                  ref={this.formFields.teacherName.event}
                  value={this.state.creatingAccount.teacherName}
                  onChange={e => this.formOnChangeHandler(e, 'teacherName')}
                  onBlur={e => this.validateFieldOnBlurHandler(e, 'teacherName')}
                />
                <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.teacherName.message}</InvalidBox>
              </div>
              <div className={styles.FieldWrapper}>
                <span style={{...inputMargin, ...spanWidth}}>{this.formFields['gender'].label}:</span>
                <Radio.Group
                  value={this.state.creatingAccount.gender}
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
                  value={this.state.creatingAccount.birthday}
                  onChange={e => {this.formOnChangeHandler(e, 'birthday'); this.validateFieldOnBlurHandler(e, 'birthday');}}
                />
                <InvalidBox margin="5px 16px 0 148px" width="200px">{errorProps.birthday.message}</InvalidBox>
              </div>
              <div
                className={styles.FieldWrapper}
                style={{display: 'flex', justifyContent: 'center'}}>
                <Button color="success" clicked={this.submitFormHandler} disabled={this.state.submittingForm}>Create</Button>
              </div>
            </div>
          </div>
        }
      </Fragment>
    );
  }
}

export default CreateAccount;
