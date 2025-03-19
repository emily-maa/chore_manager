import React from 'react';
import Users from './Users';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateHousehold from './pages/CreateHousehold';
import ParentDashboard from './pages/ParentDashboard';
import Login from './pages/Login';
// import ChildLogin from './pages/ChildLogin';
// import HomePage from './pages/HomePage';
// import NotFound from './pages/NotFound';

function App() {
  // return (
  //   <div className="App">
  //     <Users />
  //   </div>
  // );
  return (
    // <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/create-household" element={<CreateHousehold />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        {/* <Route path="/child-login" element={<ChildLogin />} />
        <Route path="*" element={<NotFound />} /> */}
      </Routes>
    // </BrowserRouter>
  );
}

export default App;
