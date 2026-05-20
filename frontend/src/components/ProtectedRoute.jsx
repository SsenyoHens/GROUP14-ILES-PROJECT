import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    if (!user?.tokens?.access) {

        return <Navigate to="/login" />
    }

    return children
}

export default ProtectedRoute