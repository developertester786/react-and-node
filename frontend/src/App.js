import React from "react";
import logo from './logo.svg';
import Header from './Components/Header/Header';
import Login from './Components/Login/Login';
import Footer from './Components/Footer/';
import './App.css';

const App  =(props) =>{
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/admin")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
    <div className="App">
      <Header />
      <Login/>
      <Footer />
    </div>
  );
}

export default App;