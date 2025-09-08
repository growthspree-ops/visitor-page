import React, { useEffect, useState } from 'react';
import './index.css';
import { Col, Form, Row, Button,InputGroup } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';


import login_img from '../../assets/login-img.jpg'
// import google_icon from '../../../assets/images/google-icon.webp'
import growthspreeLogo from '../../assets/growthspreeLogo.png'

const SignIn = () => {
  const [inputUserName,setInputUserName] = useState("");//Change to "" after Testing
  const [inputPassword, setInputPassword] = useState("");// Change to "" after Testing
  // const [rememberMe,setRememberMe] = useState(false);
  const [validated, setValidated] = useState(false);
  const [authToken,setAuthToken] = useState(null);
  const [wrongCred,setWrongCred] = useState(false);

  const handleUserNameChange= (e) => {
    setInputUserName(e.target.value)
  }
  const handlePasswordChange = (e) => {
    setInputPassword(e.target.value)
  }
  
  // const handleRememberMEChange = () => {
  //   setRememberMe(!rememberMe)
    
  // }

  const  handleSubmit = async (event) => {
    event.preventDefault();
    setWrongCred(false)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);
    console.log("validity",form.checkValidity());
    
    if(form.checkValidity() === true){
      await axios({
        url:`${import.meta.env.VITE_BACKEND_URL}auth/`,
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        data:{
          "username":inputUserName, 
          "password":inputPassword
        }
      }).then((response) => {
        if(response.data.token!==null || response.data.token!== ""){
          const token = response.data.token;

          axios({
            url:`${import.meta.env.VITE_BACKEND_URL}api/lookup-refreshtoken/`,
            method:"POST",
            headers:{
              "Content-Type":"application/json",
            },
            data:{
              "mytoken":token
            }
          }).then((res) => {
            setAuthToken(token);
            let refreshToken = res.data.refresh_token?'True':'False';
            Cookies.set('authToken',authToken,{expires: 7});
            Cookies.set('refresh_token',refreshToken,{expires: 7});
            Cookies.set('customer_id',res.data.customer_id,{expires: 7});
          })
        }
      }).catch((err) => {
        setValidated(false);
        setWrongCred(true);
        console.log(err.response.data.non_field_errors[0]);
      })
    }
  };

  useEffect(() => {
    if(authToken !== null){
      Cookies.set('authToken',authToken,{expires: 7})
      window.location.href="/";
    }
  },[authToken]);

  useEffect(() => {
    if(Cookies.get('authToken')!==null && Cookies.get('authToken')!==undefined){
      window.location.href="/";
    }
  },[])
  
  // useEffect(() => {console.log(rememberMe);
  // },[rememberMe]);


  return (
    <>
      <div className='login-wrapper'>
        <Row className='login-container'>
          <Col sm={4} className='image-container'>
            <div className='logo-container'>
              <img src={growthspreeLogo} alt='Growthspree' />
            </div>
            <img src={login_img} alt='Login Img' />
            <div>
              <p className='m-0' style={{fontSize:'16px',color:"#1b1b1b"}} >Boost your Google Ads performance with AI-powered keyword analysis, landing page insights, and detailed audit reports—optimized for success!</p>
            </div>
          </Col>
          <Col className='login-data-container' sm={8}>
            <div style={{width:"100%",maxWidth:"500px"}}>

              <h1 className='form-heading'>Hello, Welcome :)</h1>
              <p className='form-paragraph mb-1'>Enter details below to login.</p>
              {wrongCred?<>
                <p className='form-paragraph-red mb-0'>Incorrect login credentials</p>
              </>:""}
              <Form className='mt-5' style={{width:"100%"}} noValidate validated={validated} onSubmit={handleSubmit}>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1"><i className='feather icon-user' /></InputGroup.Text>
                    <Form.Control onChange={handleUserNameChange} value={inputUserName} type="text" placeholder="username" required />
                    <Form.Control.Feedback type="invalid">
                      Please Enter Username.
                    </Form.Control.Feedback>
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1"><i className='feather icon-lock' /></InputGroup.Text>
                    <Form.Control onChange={handlePasswordChange} value={inputPassword} type="password" placeholder='Password' required />
                    <Form.Control.Feedback type="invalid">
                      Please Enter Password.
                    </Form.Control.Feedback>
                </InputGroup>

                {/* <Form.Group className="mb-3" controlId="formBasicCheckbox">
                  <Form.Check type="checkbox" onChange={handleRememberMEChange} label="Remember me" />
                </Form.Group> */}
                <Button className='login-btn' variant="primary" type="submit">
                  Log in
                </Button>
              </Form>
              {/* <p className='my-3 small-text'>or you can login with</p>
              <div>
                <button className='login-icon-btn'><img src={google_icon} alt="google" /></button>
              </div> */}
            </div>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default SignIn