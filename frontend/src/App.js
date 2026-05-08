import {
    BrowserRouter,
    Routes,
    Route
} from 'react-router-dom'

import Supervisors from './pages/Supervisor'
import Login from './pages/Login'

import StudentDashboard from './pages/StudentDashboard'
import AcademicDashboard from './pages/AcademicDashboard'
import WeeklyLogs from './pages/WeeklyLogs'

import ProtectedRoute from './components/ProtectedRoute'

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Supervisors />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/academic"
                    element={
                        <ProtectedRoute>
                            <AcademicDashboard />
                        </ProtectedRoute>
                    }
                />
				
				<Route
                    path="/weekly-logs"
                    element={
                        <ProtectedRoute>
                            <WeeklyLogs />
                        </ProtectedRoute>
                    }
                />
            </Routes>

        </BrowserRouter>

    )
}

export default App