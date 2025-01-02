import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AddQuiz from './components/AddQuiz';
import TestList from './components/TestList';
import GroupDetail from './components/GroupDetail';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/admin/:id' element={<GroupDetail />} />
        <Route path='/addquiz' element={<AddQuiz />} />
        <Route path='/testlist' element={<TestList />} />
      </Routes>
    </>
  );
}

export default App;