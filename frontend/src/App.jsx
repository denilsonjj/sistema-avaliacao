import { Outlet } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext'; // Import it here

function App() {
  return (
    <AuthProvider>
      <div>
        <Outlet />
      </div>
    </AuthProvider>
  );
}

export default App;
