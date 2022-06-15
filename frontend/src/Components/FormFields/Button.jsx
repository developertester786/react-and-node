import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Button =(props) =>{
  
    return (
        <div className="button-container">
            <input type={props.type} value={props.value} name={props.name}/>
        </div>
    )
  
}
export default Button;