import { Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 

function App() {
  return (
    <AuthProvider>
      <ThemeProvider> 
        <div>
          <Outlet />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;