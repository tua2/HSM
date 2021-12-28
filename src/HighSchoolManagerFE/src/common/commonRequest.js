import axios from 'axios';
import {message} from 'antd';

class CommonRequest {
  static optionsList = {
    "cred": {
      withCredentials: true
    },
  };
  //opts="opt1,opt2"
  static getOpts(opts) {
    return opts.split(',').map(key => {return this.optionsList[key]})
      .reduce((optsObj, opt) => {
        return optsObj = {...optsObj, ...opt}
      });
  }

  // 'options' is an string of multiple options, reflect with optionsList
  static get(url, options, thenFunc, catchFunc) {
    const req = axios.get(url, this.getOpts(options));
    if (typeof thenFunc !== "undefined")
      req.then(response => thenFunc(response));
    if (typeof catchFunc !== "undefined")
      req.catch(error => catchFunc(error));
    return req;
  }
  static post(url, data, options, thenFunc, catchFunc) {
    const req = axios.post(url, data, this.getOpts(options))
    if (typeof thenFunc !== "undefined")
      req.then(response => thenFunc(response));
    if (typeof catchFunc !== "undefined")
      req.catch(error => catchFunc(error));
    return req;
  }
  static put(url, data, options, thenFunc, catchFunc) {
    const req = axios.put(url, data, this.getOpts(options))
    if (typeof thenFunc !== "undefined")
      req.then(response => thenFunc(response));
    if (typeof catchFunc !== "undefined")
      req.catch(error => catchFunc(error));
    return req;
  }
  static delete(url, options, thenFunc, catchFunc) {
    const req = axios.delete(url, this.getOpts(options))
    if (typeof thenFunc !== "undefined")
      req.then(response => thenFunc(response));
    if (typeof catchFunc !== "undefined")
      req.catch(error => catchFunc(error));
    return req;
  }

  static showError(error) {
    error.response.data.messages.forEach(m => {
      Object.keys(m).forEach(mKey => {
        message.error(m[mKey])
      });
    });
  }

  static showDescriptiveError(error, key) {
    error.response.data[key].forEach(m => {
      message.error(m.description);
    });
  }

  static timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

export default CommonRequest;
