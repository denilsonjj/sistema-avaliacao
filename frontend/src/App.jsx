// frontend/src/App.jsx
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Importe

function App() {
  return (
    <AuthProvider>
      <ThemeProvider> {/* Envolva com o ThemeProvider */}
        <div>
          <Outlet />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;