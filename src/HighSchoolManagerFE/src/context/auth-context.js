import React from 'react';

const authContext = React.createContext({
  isAuthen: false,
  isAuthor: false,
  user: {
    username: '',
    role: '',
  },
  teacher: {}
});

export default authContext;
