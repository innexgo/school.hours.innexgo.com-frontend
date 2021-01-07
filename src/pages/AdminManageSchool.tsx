
import React from 'react';
import { Link } from 'react-router-dom';

// Bootstrap CSS & JS
import '../style/dashboard.scss';
import 'bootstrap/dist/js/bootstrap';
import 'popper.js/dist/popper';

function AdminManageSchool() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw"
    }}>
      <div className="my-auto mx-auto text-center">
        <h1>Admin manage school</h1>
        <h5>Page under construction</h5>
        <Link to="/">Return Home</Link>
      </div>
    </div>
  )
}

export default AdminManageSchool
