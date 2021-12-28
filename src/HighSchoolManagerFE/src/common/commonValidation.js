import React from 'react';

class CommonValidation {
  /*
  FORM FIELDS
  'event' is assigned at componentDidMount; errorMessage is assigned at validateForm()
  this.formFields = {
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
      validates: [],
      errorMessage: '',
    },
    birthday: {
      event: {},
      label: 'Date of Birth',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
    address: {
      event: {},
      label: 'Address',
      validates: [{name: 'NotNull', params: []}],
      errorMessage: '',
    },
  };

  INVALID FIELDS
  this.state.invalidFields = ['lastName', 'birthday', ...];
  */

  /*
  TODO TODO TODO
  formOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    this.setState(prevState => {
      let newStudent = {...prevState.addingStudent};
      newStudent[key] = value;
      return {addingStudent: newStudent};
    });
  };
  */
  static validateForm(formFields, invalidFieldsName, component) {
    let _invalidFields = [];
    Object.keys(formFields).forEach(fieldId => {
      const _value = formFields[fieldId].event.current.props.value;
      const validated = CommonValidation.validateField(formFields, fieldId, _value);
      if (!validated)
        _invalidFields.push(fieldId);
    });
    component.setState({[invalidFieldsName]: _invalidFields});
    if (_invalidFields.length > 0) {
      const firstInvalid = formFields[_invalidFields[0]].event.current;
      if (firstInvalid.focus)
        firstInvalid.focus();
      return false;
    }
    return true;
  }

  static initFormFields(formFields) {
    Object.keys(formFields).forEach(e => {
      formFields[e].event = React.createRef();
    });
  }

  // Data Validations
  static validate_NotNull(value) {
    return !!value;
  }
  static validate_Num(value) {
    return !isNaN(value);
  }
  static validate_Int(value) {
    return Number.isInteger(Number(value));
  }
  static validate_Range(value, from, to) {
    return (value >= from && value <= to);
  }
  static validate_RangeFrom(value, from) {
    return value >= from;
  }
  static validate_RangeTo(value, to) {
    return value <= to;
  }
  static validate_FromYearsOld(value, from) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return (value.year() <= (currentYear - from));
  }
  static validate_ToYearsOld(value, to) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return (value.year() >= (currentYear - to));
  }

  // Single Field Validation
  static validateField(formFields, fieldId, value) {
    const validationList = [...formFields[fieldId].validates];
    //let validatedCount = 0;
    let isInvalid = false;
    validationList.forEach(validate => {
      if (isInvalid)
        return;
      let validated = false;
      const _params = validate.params;
      switch(validate.name) {
        case 'NotNull':
          validated = this.validate_NotNull(value);
          formFields[fieldId].errorMessage = 'Required';
          break;
        case 'Int':
          validated = this.validate_Int(value);
          formFields[fieldId].errorMessage = 'Must be integer';
          break;
        case 'Range':
          validated = this.validate_Range(value, _params[0], _params[1]);
          formFields[fieldId].errorMessage = `Must be from ${_params[0]} to ${_params[1]}`;
          break;
        case 'RangeFrom':
          validated = this.validate_RangeFrom(value, _params[0]);
          formFields[fieldId].errorMessage = `Must be >= ${_params[0]}`;
          break;
        case 'RangeTo':
          validated = this.validate_RangeTo(value, _params[0]);
          formFields[fieldId].errorMessage = `Must be <= ${_params[0]}`;
          break;
        case 'FromYearsOld':
          validated = this.validate_FromYearsOld(value, _params[0]);
          formFields[fieldId].errorMessage = `Must be ${_params[0]} or older`;
          break;
        case 'ToYearsOld':
          validated = this.validate_ToYearsOld(value, _params[0]);
          formFields[fieldId].errorMessage = `Must be younger than ${_params[0] +1}`;
          break;
        default:
          validated = false;
          break;
      }
      if (!validated)
        isInvalid = true;
      //validatedCount += (validated)?1:0;
    });
    //return (validatedCount === validationList.length);
    return !isInvalid;
  }

  /*
  GET ERROR PROPS
  errorProps = {
    ‘lastName’: {
      style: {boxShadow: ‘0 0 10px #ef7e89’},
      message: this.formInputs[‘lastName’].errorMessage
    }
    ‘birthday’: {
      style: {boxShadow: ‘0 0 10px #ef7e89’},
      message: this.formInputs[‘birthday’].errorMessage
    }
}
  */
  static getErrorProps (formFields, invalidFields) {
    const errorProps = Object.keys(formFields).reduce((fieldsObj, fieldId) => {
      let _fieldsObj = {
        ...fieldsObj,
        [fieldId]: {
          style: {},
          message: "",
        }
      };
      if (invalidFields.includes(fieldId)) {
        _fieldsObj[fieldId].style = {boxShadow: '0 0 10px #ef7e89'};
        _fieldsObj[fieldId].message = formFields[fieldId].errorMessage;
      }
      return _fieldsObj;
    }, {});
    return errorProps;
  }
}

export default CommonValidation;
