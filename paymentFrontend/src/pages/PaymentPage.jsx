import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
export const PaymentPage = () => {
    const token = localStorage.getItem('token')

    const location = useLocation();

    const{userId, fullname} =  location.state;
    console.log("fullname is ", fullname);

    const [amount, setAmount] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const navigate = useNavigate();
    const handleChange = (event) => {
        setAmount(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/v1/account/transfer", { toId: userId, amount }

                ,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }

            );
            console.log(response.data);
            toast.success('Payment successful!');
            setModalIsOpen(true);

            setTimeout(() => {
                setModalIsOpen(false);
                navigate("/dashboard");
            }, 3000);
        } catch (error) {
            if (error.response && error.response.data) {
                console.error("Error response data:", error.response.data.message);
                toast.error(`Error: ${error.response.data.message}`);
            } else {
                console.error("Error:", error.message);
                toast.error(`Error: ${error.message}`);
            }
        }

        toast.success('Payment successful!');
        setModalIsOpen(true);

        setTimeout(() => {
            setModalIsOpen(false);
            navigate("/customerDashboard");
        }, 5000);
    };

    return (
        <div>
            <div>
                Pay {fullname}
                <br />
                <br />
                <label htmlFor="amountInput">Enter amount :</label>
                <br />
                <br />
                <input
                    type="number"
                    id="amountInput"
                    name="amount"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleChange}
                    min="0"
                />
                <br />
                <br />
                <button onClick={handleSubmit} disabled={!amount || parseFloat(amount) <= 0}
                >Initiate Transfer</button>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                }}
                contentLabel="Payment Successful"
            >
                <h2>Payment Successful!</h2>
                <p>Redirecting you to your dashboard...</p>
            </Modal>
        </div>
    );
};

export default PaymentPage;
