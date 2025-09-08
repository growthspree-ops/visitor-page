import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

const AuthGuard = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => Cookies.get('authToken') || null); // ✅ Initialize state from cookies

  useEffect(() => {
    const token = Cookies.get('authToken');
    setAuthToken(token);
  }, []);

  if (authToken === null || authToken === undefined) {
    return (<Navigate to="/login" />); 

  }

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthGuard;
