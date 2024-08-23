import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Signup  from './pages/Signup'
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CustomerDashboard } from './pages/CustomerDashboard'
import { PaymentPage } from './pages/PaymentPage'
import { BankAccountPage } from './pages/BankAccountPage'
import PRoute from './pages/PRoute'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>  
        <BrowserRouter>
            <Routes>
                      <Route  path='/signup' element={<Signup />}  > </Route>  
                      
                      <Route element={<PRoute/> }>
                      <Route  path='/customerDashboard' element={<CustomerDashboard />}>  </Route>  
                      <Route  path='/paymentPage'  element = {<PaymentPage />}> </Route>
                      <Route path="/manageBanks" element = {<BankAccountPage  />} >  </Route >
                      </Route>
                     
                      {/* <Route  path="/" >
                      <Route  path='/getBanksof1customer'>
                      <Route  path='/customerAdd1Bank'>
                      <Route  path='/changeCustomerPassword'> 
                      <Route path='/customerGet1BankInfoWithBalance'>
                      <Route  path='/changeAdminPassword'> 
                      <Route path='/adminDashboard' >
                      <Route path='adminSignin' >
                      <Route  path='/adminAddBankToDb'>
                      */}
            </Routes>
            <ToastContainer /> 
        </BrowserRouter>

    </>      
  )
}

export default App
