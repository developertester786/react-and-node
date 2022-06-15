import React,{ useState } from 'react'
import Input from '../FormFields/Input'
import Password from '../FormFields/Password'
import Button from '../FormFields/Button'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../FormFields.css';

const Login = () => {
    const [errorMessages, setErrorMessages] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const renderErrorMessage = (name) =>
    name === errorMessages.name && (
        <div className="error">{errorMessages.message}</div>
    )

    const database = [
        {
        username: "user1",
        password: "pass1"
        },
        {
        username: "user2",
        password: "pass2"
        }
    ];
    
    const errors = {
        uname: "Invalid Username",
        pass: "Invalid Password"
    };

    let submitHandler = (event) => {
        event.preventDefault();
        
        var { uname, pass } = document.forms[0];

        // Find user login info
        const userData = database.find((user) => user.username === uname.value);

        // Compare user info
        if (userData) {
            if (userData.password !== pass.value) {
                // Invalid password
                setErrorMessages({ name: "pass", message: errors.pass });
            } else {
            setIsSubmitted(true);
            }
        } else {
            // Username not found
            setErrorMessages({ name: "uname", message: errors.uname });
        }
    }

    return (
        <div className="list-container">
            <form className="form login-form" onSubmit={submitHandler}>
                <Input name="uname" placeholder="Enter username" heading="Username" errormsg={renderErrorMessage("uname")}/>
                <Password name="pass" placeholder="Enter password" heading="Password" errormsg={renderErrorMessage("pass")}/>
                <Button type="submit" value="Login" name="login"/>
            </form>
        </div>
    )
}

export default Login;