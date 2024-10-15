// import '../App.css'
import { useState } from 'react';
import { listofbanks } from '../bankData';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
    console.log("called");
    const navigate = useNavigate();

    const [isSigninClicked, setIsSigninClicked] = useState(false);
    const [isSignupClicked, setIsSignupClicked] = useState(true);
    const [signinFormData, setSigninFormData] = useState({ username: "", password: "" });
    const [signupFormData, setSignupFormData] = useState({
        username: "",
        password: "",
        firstname: "",
        lastname: "",
        bankId: ""
    });

    function isSigninClickedFn() {
        setIsSigninClicked(true);
        setIsSignupClicked(false);
    }

    function isSignupClickedFn() {
        setIsSignupClicked(true);
        setIsSigninClicked(false);
    }

    function handleChangeSignup(e) {
        setSignupFormData({ ...signupFormData, [e.target.name]: e.target.value });
    }

    function handleChangeSignin(e) {
        const { name, value } = e.target;
        setSigninFormData({ ...signinFormData, [name]: value });
    }

    function handleSubmitSignup(e) {
        e.preventDefault();
        console.log(signupFormData);

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
                    });
                }
            })
            .then(data => {
                console.log("Signup successful:", data);
                toast.success('Signup successful!');
                localStorage.setItem("token", data.token);
                let tokenxx = localStorage.getItem("token");
                console.log("tokenxx ", tokenxx);
                navigate("/customerDashboard");
            })
            .catch(err => {
                console.log(err.message);
                toast.error(`Error: ${err.message}`);
            });
    }

    async function handleSubmitSignin(e) {
        e.preventDefault();
        console.log(signinFormData);
        try {
            const response = await fetch("http://localhost:3000/api/v1/user/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(signinFormData)
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data);
                toast.success('Signin successful!');
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", signinFormData.username);
                navigate("/customerDashboard");
            } else {
                throw new Error(data.message || 'An error occurred');
            }
        } catch (error) {
            console.error("Error:", error.message);
            toast.error(`Error: ${error.message}`);
        }
    }

    return (
        <div>
            <div style={{ fontWeight: 'bold' }}>
                Full-Stack Multi-Bank Account UPI Payment Simulation Application
            </div>
            <br />
            <div>
                <span>
                    <button style={{ fontSize: "16.5px" }} onClick={isSignupClickedFn}>--signup-- </button>
                </span>
                <span>
                    <button style={{ fontSize: "16.5px" }} onClick={isSigninClickedFn}>--signin--</button>
                </span>
            </div>

            <div>
                {isSignupClicked && (
                    <form onSubmit={handleSubmitSignup}>
                        <br />
                        <input type="text" onChange={handleChangeSignup} name="username" value={signupFormData.username} placeholder='enter username' required />
                        <br /><br />
                        <input type="password" onChange={handleChangeSignup} name="password" value={signupFormData.password} placeholder='enter password' required />
                        <br /><br />
                        <input type="text" onChange={handleChangeSignup} name="firstname" value={signupFormData.firstname} placeholder='enter firstname' required />
                        <br /><br />
                        <input type="text" onChange={handleChangeSignup} name="lastname" value={signupFormData.lastname} placeholder='enter lastname' required />
                        <br /><br />
                        <select onChange={handleChangeSignup} name="bankId" value={signupFormData.bankId} required>
                            <option value="" disabled>Select a bank</option>
                            {listofbanks.map((x, index) => (
                                <option key={index} value={x.bankId}>
                                    -- {x.bankname}--
                                </option>
                            ))}
                        </select>
                        <br /><br />
                        <button type="submit">sign up</button>
                    </form>
                )}

                {isSigninClicked && (
                    <form onSubmit={handleSubmitSignin}>
                        <br />
                        <input type="email" required onChange={handleChangeSignin} name="username" value={signinFormData.username} placeholder='enter username' />
                        <br /><br />
                        <input type="password" onChange={handleChangeSignin} name="password" value={signinFormData.password} placeholder='enter password' required />
                        <br /><br />
                        <button type='submit'>signin</button>
                    </form>
                )}
            </div>
        </div>
    );
}
