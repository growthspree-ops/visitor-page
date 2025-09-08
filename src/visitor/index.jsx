import React, { useEffect, useState } from 'react'
import Loader from '../components/Loader'
import Cookies from 'js-cookie';
import DataTableRB from '../components/Table/VisitorsTable';
import Integrations from './integrations';
import './index.css'
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { Button, Form } from 'react-bootstrap';

const Visitors = () => {
  const [currTab, setCurrTab]=useState('visitors')
  const [loading, setLoading]=useState(true)
  const [data, setData]=useState([])
  const [error, setError]=useState({visibility:false, message:""})
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split("T")[0],
    new Date().toISOString().split("T")[0]
  ]);

  const handleLogout = async () =>{
        // Get all cookies
        const allCookies = Cookies.get();

        // Loop through cookies and remove each one
        Object.keys(allCookies).forEach(cookieName => {
          Cookies.remove(cookieName);
        });

        // Optionally redirect user to login or home page
        window.location.href = "/login"; 
  }

  const getCompanyData = async () =>{
    setLoading(true)
    fetch(`${import.meta.env.VITE_BACKEND_URL}api/get_company_details/?project_id=16&start_date=${dateRange[0]}&end_date=${dateRange[1]}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok',response);
        }
        return response.json();
    })
    .then((response) => {
        setData(response)
        setLoading(false)
    })
    .catch((error) => {
        setError({visibility:true, message:error.message})
        setLoading(false)
        console.error('There was a problem with the fetch operation:', error);
    });
  }
  useEffect(()=>{
    getCompanyData()
  },[])


  if(loading){
    return <Loader />
  }
  if(error.visibility){
    return <div className='text-center text-danger'>Error: {error.message}</div>
  }

  return (
    <>
        <div className="tab-wrapper ps-3 pe-4">
          <div className='tab-distance'>

            <div className="tab-header m-0">
                    <button className={currTab==='visitors'?'tab-btn active':'tab-btn'} onClick={()=>{setCurrTab("visitors")}}>Visitors</button>
                    <button className={currTab==='integrations'?'tab-btn active':'tab-btn'} onClick={()=>{setCurrTab("integrations")}}>Integrations</button>
            </div>

            <div className='logout' onClick={handleLogout}>Log Out</div>
          </div>
            <div className="tabs-content">
              {currTab === 'visitors' && (
                <>
                  <div className="d-flex flex-row justify-content-start align-items-end gap-2">
                    <Form.Group className="w-full gap-5">
                      <Form.Label>Select Date Range</Form.Label>
                      <Flatpickr
                        style={{width:"260px"}}
                        className="form-control" // Bootstrap form styling
                        options={{ mode: "range", maxDate: "today" }}
                        value={dateRange}
                        onChange={(selectedDates) => {
                          if (selectedDates.length === 2) {
                            setDateRange(
                              selectedDates.map(date => {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
                                const day = String(date.getDate()).padStart(2, '0');
                                return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
                              })
                            );
                          }
                        }}
                      />
                    </Form.Group>
                    <Button variant="primary" className="m-0" onClick={getCompanyData}>Submit</Button>
                  </div>
                  <DataTableRB
                    data={data}
                    csvName="Visitors.csv"
                    searchBarColumn="company_name"
                    columnOrder={["company_name", "domain", "employees", "revenue", "url_visited", "timestamp", "gclid","utm_source","utm_medium","utm_campaign","utm_term","utm_content","utm_id"]}
                  />
                </>
              )}
              {currTab === 'integrations' && (
                <Integrations />
              )}
            </div>
        </div>
    </>
  )
}

export default Visitors