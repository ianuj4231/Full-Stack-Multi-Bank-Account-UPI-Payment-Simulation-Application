import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const PRoute = () => {
    const nav = useNavigate();
    console.log('first received')
    const state = localStorage.getItem('token')
    
    useEffect(()=> {
        // Boolean(!state) && nav('/signup')

        if(!state){
          nav("/signup");
        }
      },[])

    // return state ?  nav("/signup") :  <div>  <Outlet /> </div>  

  return (
    <div> 
        <Outlet />

    </div>
  )
}

export default PRoute