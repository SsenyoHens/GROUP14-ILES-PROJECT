import { Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/student_intern/Dashboard";
import Logbook from "./pages/student_intern/Logbook";
import MyEvaluation from "./pages/student_intern/MyEvaluation";
import MyPlacement from "./pages/student_intern/MyPlacement";
import MyProfile from "./pages/student_intern/MyProfile";

function App() {
  return (
    
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <div
          style={{
            width: "220px",
            background: "#0b1742",
            color: "white",
            padding: "20px",
          }}
        >
          <h2>ILES Portal</h2>

          <ul style={{ listStyle: "none", padding: 0 }}>

            <li style={{ margin: "20px 0" }}>
              <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                Dashboard
              </Link>
            </li>

            <li style={{ margin: "20px 0" }}>
              <Link
                to="/logbook"
                style={{ color: "white", textDecoration: "none" }}
              >
                Logbook
              </Link>
            </li>

            <li style={{ margin: "20px 0" }}>
              <Link
                to="/evaluations"
                style={{ color: "white", textDecoration: "none" }}
              >
                My Evaluations
              </Link>
            </li>

            <li style={{ margin: "20px 0" }}>
              <Link
                to="/placement"
                style={{ color: "white", textDecoration: "none" }}
              >
                My Placement
              </Link>
            </li>

            <li style={{ margin: "20px 0" }}>
              <Link
                to="/profile"
                style={{ color: "white", textDecoration: "none" }}
              >
                My Profile
              </Link>
            </li>

          </ul>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "30px",
            background: "#f4f4f4",
          }}
        >
          <Routes>
		    <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logbook" element={<Logbook />} />
            <Route path="/evaluations" element={<MyEvaluation />} />
            <Route path="/placement" element={<MyPlacement />} />
            <Route path="/profile" element={<MyProfile />} />
</Routes>
        
        </div>

      </div>
 
  );
}

export default App;