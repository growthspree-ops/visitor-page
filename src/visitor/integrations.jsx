import React, { useEffect, useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import Loader from '../components/Loader';
import Cookies from 'js-cookie';

const Integrations = () => {
    const [customerId, setCustomerId] = useState(null)
    const [customer_url, setCustomerUrl] = useState(null)
    const [copyBtnText, setCopyBtnText] = useState("Copy to clipboard")
    const [verifyText, setVerifyText] = useState("Verify")
    const [showVerify, setShowVerify] = useState(false)


    const CopyToClipboard = ()=>{
        navigator.clipboard.writeText(`<script>!function(e,t,r,a,n){var p=t.getElementsByTagName(r)[0],c=t.createElement(r);c.async=!0,c.src=a+"?id="+n,p.parentNode.insertBefore(c,p)}(window,document,"script","https://ip-tracker-blond.vercel.app/api/pixel.js","${customerId}");</script>`);
        setCopyBtnText("Copied!")
        setTimeout(()=>{
            setCopyBtnText("Copy to clipboard")
        },2000)
    }

    const handleVerify = ()=>{
        if(!customer_url || customer_url.trim() === ""){
            alert("Please enter a valid URL");
            return
        }
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/verify_pixel/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: customer_url,
                pixel_id: customerId
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((res)=>{
            if(res.success){
                setVerifyText("Verified")
                setShowVerify(true)
            }
            else{
                setVerifyText("Verify")
                setShowVerify(false)
            }
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }
    useEffect(()=>{
        if(!customerId){
            fetch(`${import.meta.env.VITE_BACKEND_URL}api/get_client_id/?project_id=16`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((response) => {
                if(response.client_id){
                    setCustomerId(response.client_id)
                    setCustomerUrl(response.url)
                }
                if(response.url){
                    setVerifyText("Verified")
                    setShowVerify(true)
                }
            })
            .catch((error) => {
                console.error('There was a problem with the fetch operation:', error);
            });
        }
    },[])


    if(!customerId){
        return <Loader />
    }

  return (
    <>
        <Card className='rounded'>
            <Card.Header className='d-flex justify-content-between align-items-center'>
                <Card.Title as="h5">Integration</Card.Title>
                {showVerify && <span className='badge bg-success'>Verified</span>}
                {!showVerify && <span className='badge bg-danger'>Not Verified</span>}
            </Card.Header>
            <Card.Body>
                <h6>Copy and paste the This code into the <code>{"<head>"}</code> element of your site or app.</h6>
                <div className='p-3 bg-light mt-3 mb- rounded' style={{overflowX:"auto",maxWidth:"600px"}}>
                    {`<script>!function(e,t,r,a,n){var p=t.getElementsByTagName(r)[0],c=t.createElement(r);c.async=!0,c.src=a+"?id="+n,p.parentNode.insertBefore(c,p)}(window,document,"script","https://ip-tracker-blond.vercel.app/api/pixel.js","${customerId}");</script>`}
                </div>
                <Button 
                    onClick={CopyToClipboard}
                    variant={copyBtnText!=="Copied!"?"primary":"success"} 
                    size='sm' 
                    className='mt-3'
                >{copyBtnText}</Button>

                <div className='mt-4'>
                    <h6>Once pasted the above code, Verify here</h6>
                    <div style={{display:'flex',alignItems:'center',gap:'10px',flexDirection:"row"}} className='mt-2'>
                        <input 
                            type="text" 
                            className='form-control'
                            value={customer_url}
                            onChange={(e)=>{setCustomerUrl(e.target.value);setVerifyText("Verify")}}
                            style={{maxWidth:'600px'}}
                        />
                        <Button style={{width:'auto',margin:0}} variant={verifyText==="Verified"?"success":'primary'} onClick={handleVerify} >{verifyText}</Button>
                    </div>
                </div>

            </Card.Body>
        </Card>
    </>
  )
}

export default Integrations