import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
   <>
      <Navbar />

      <div className="d-flex">
        <Sidebar />

        <main className="flex-fill p-4" style={{ background: '#F5F7FA' }}>
          {/* Page Content */}
        </main>
      </div>
    </>
  );
}

export default App;
