import { Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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
