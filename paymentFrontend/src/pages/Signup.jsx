// import '../App.css'
import { useState, useEffect } from 'react';
import { listofbanks } from '../bankData';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';
let changes = false;
export default function Signup() {
    console.log("cllaed")
    const navigate  = useNavigate();

    const [isSigninClicked, setIsSigninClicked] = useState(false);
    const [isAlert, setIsAlert] = useState(false);
    const [isSignupClicked, setIsSignupClicked] = useState(true);
    const [signinFormData, setSigninFormData] = useState({ username: "", password: "" })
    const [signupFormData, setSignupFormData] = useState({
        username: "",
        password: "",
        firstname: "",
        lastname: "",
        bankId: ""
    })
    useEffect(() => {
        let timerId;
        if( changes ){

            timerId =  setTimeout(() => {
            changes = false
                 setIsAlert( (prev) => !prev)
     
             }, 2000);
        }
        return () => clearTimeout(timerId)
    },[isAlert])
    function isSigninClickedFn() {
        setIsSigninClicked(true);
        setIsSignupClicked(false);
    }
    function isSignupClickedFn() {
        setIsSignupClicked(true);
        setIsSigninClicked(false);
    }
    function handleChangeSignup(e) {
        setSignupFormData({ ...signupFormData, [e.target.name]: e.target.value })
    }

    function handleChangeSignin(e) {
        const { name, value } = e.target;
        setSigninFormData({ ...signinFormData, [name]: value })
    }


    function handleSubmitSignup(e) {
        e.preventDefault();

        fetch("http://localhost:3000/api/v1/user/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(signupFormData)
        })

            .then((response) => {
                if (response.ok) {
                    console.log("Signup successful:", response);

                    return response.json();
                } else {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || 'An error occurred');
                    }
                    );
                }
            })
            .then(data => {
                console.log("Signup successful:", data);
                // localStorage.setItem("username", username);
                toast.success('Signup successful!');
                navigate("/customerDashboard")
            })
            .catch(err => {
                console.log(err.message);
                toast.error(`Error: ${err.message}`);
            });
    }

    /*
     async function handleSubmitSignup(e) {
         e.preventDefault();
     
         try {
             const response = await axios.post("http://localhost:3000/api/v1/user/signup", signupFormData);
             console.log(response.data);
             toast.success('Signup successful!');
         } catch (error) {
             if (error.response && error.response.data) {
                 console.error("Error response data:", error.response.data.message);
                 toast.error(`Error: ${error.response.data.message}`);
             } else {
                 console.error("Error:", error.message);
                 toast.error(`Error: ${error.message}`);
             }
         }
     }
 
     */
function handleForm (e){
    e.preventDefault()
    const formData = new FormData(e.target);
    console.log(formData)
    if(formData.get('username') =='' || formData.get('password') == '') {
        changes = true
        setIsAlert(true)
        return
    }
    else{
        handleSubmitSignin()
    }
}
    async function handleSubmitSignin() {
        console.log(signinFormData);
        try {
            const response = await axios.post("http://localhost:3000/api/v1/user/signin", signinFormData);
            console.log(response.data);
            toast.success('Signin successful!');
            localStorage.setItem( "token" , response.data.token)
            localStorage.setItem( "username" ,signinFormData.username)
                
            navigate("/customerDashboard")

            // localStorage.setItem("username", username);

        }
        catch (error) {
            if (error.response && error.response.data) {
                console.error("Error response data:", error.response.data.message);
                toast.error(`Error: ${error.response.data.message}`);
            } else {
                console.error("Error:", error.message);
                toast.error(`Error: ${error.message}`);
            }
        }
    }

    return (
        <div>
            <div>
                <span >
                    <button style={{ fontSize: "16.5px" }} onClick={isSignupClickedFn}>--signup-- </button>
                </span>
                <span>
                    <button style={{ fontSize: "16.5px" }} onClick={isSigninClickedFn}>--signin--</button>
                </span>
            </div>

            <div>
                {isSignupClicked &&
                    <div>
                        <br></br>
                        <br></br>
                        <input type="text" onChange={handleChangeSignup} name="username" value={signupFormData.username} placeholder='enter username' />
                        <br></br>
                        <br></br>

                        <input type="password" onChange={handleChangeSignup} name="password" value={signupFormData.password} placeholder='enter password' />
                        <br></br>
                        <br></br>

                        <input type="text" onChange={handleChangeSignup} name="firstname" value={signupFormData.firstname} placeholder='enter firstname' />
                        <br></br>
                        <br></br>

                        <input type="text" onChange={handleChangeSignup} name="lastname" value={signupFormData.lastname} placeholder='enter lastname' />
                        <br></br>
                        <br></br>

                        <select onChange={handleChangeSignup} name="bankId" value={signupFormData.bankId} required>
                            <option value="" disabled>Select a bank</option>
                            {
                                listofbanks.map((x, index) => (
                                    <option key={index} value={x.bankId}>
                                        -- {x.bankname}--
                                    </option>
                                ))
                            }
                        </select>


                        <br></br>
                        <br></br>

                        <button onClick={handleSubmitSignup}>  sign up  </button>
                    </div>

                }

                <div>
                    {
                        isSigninClicked && <div>
                            <form action="" onSubmit={handleForm}>
                            <br></br>
                            <br></br>
                            <input type="email" required onChange={handleChangeSignin} name="username" value={signinFormData.username} placeholder='enter username' />
                            <br></br>
                            <br></br>

                            <input type="password" onChange={handleChangeSignin} name="password" value={signinFormData.password} placeholder='enter password' />
                            <br></br>
                            <br></br>
                            <button  type='submit' > signin </button>
                            </form>
                            {isAlert && <h1> Please fill all details</h1>}
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}