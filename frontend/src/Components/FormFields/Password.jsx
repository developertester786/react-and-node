import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Password =(props) =>{
  
    return (
        <div className="input-container">
            <label>{props.heading} </label>
            <input type="text" name={props.name} placeholder={props.placeholder}/>
            {props.errormsg}
        </div>
    )
  
}
export default Password;