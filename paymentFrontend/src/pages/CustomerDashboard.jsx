import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export function CustomerDashboard() {
    const [searchWord, setSearchWord] = useState("");
    const [users, setUsers] = useState([]);
    const handleChange = (e) => {
        setSearchWord(e.target.value);
    };

    const navigate  =  useNavigate();

//   const usernamecurr = localStorage.getItem("username");
    useEffect(() => {
        console.log("users are", users);
    }, [users])

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`http://localhost:3000/api/v1/user/searchBulkUsers?searchWord=${searchWord}`,

            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        )
            .then(async function (response) {
                if (response.ok) {
                    console.log(response);
                    return response.json();
                }
                else {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || 'An error occurred');
                    }
                    );
                }
            })
            .then((data) => {
                console.log(data);
                let users = data.users;


                setUsers(users);
            })

            .catch(err => {
                console.log(err.message);
                toast.error(`Error: ${err.message}`);
            }); 


    }, [searchWord])

    // useEffect(()=>{

    // })

    

     function handleManage(){
                navigate("/manageBanks");
    }

    return (
        //navbar with firstname in left side here here

<div>
            <div>
                  <span style={{ fontWeight: 'bold' }}>  --Welcome, {localStorage.getItem("username")}--  </span>    
                  <span>
                                <button onClick={handleManage}>  Manage Bank Accounts </button>
                    </span>
                        <br>
                        </br>
                        <br>
                        </br>
            </div>
        <span>

            
                <label>  search other users </label >
                <input name="searchWord" value={searchWord} onChange={handleChange} />
                <br>
                </br>
                <br>
                </br>

                {
                    users.map((x, index) => (
                        <div>
                            <User fullname={x.fullname}
                                userId={x.userId} />
                        </div>
                    ))
                }

                </span >   
                    
 </div>
    );
}

export function User(props) {
    // console.log("props are", props);
    const { fullname, userId } = props;
    const navigate = useNavigate();
    const handlePass = (userId, fullname) => {
        console.log("fullname pre is ", fullname);
        
        navigate('/paymentPage', { state: { userId, fullname } });
    };
    return (
        <div>
            {fullname} --- <button onClick={()=> handlePass(userId, fullname)}>Send Money</button>
        </div>
    );
}

