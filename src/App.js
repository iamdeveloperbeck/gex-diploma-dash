import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AddQuiz from './components/AddQuiz';
import TestList from './components/TestList';
import GroupDetail from './components/GroupDetail';
import AnswerSheetPDF from './components/AnswerSheetPDF';
import AddSection from './components/AddSection';
import ViewTests from './components/ViewTests';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/admin/:id' element={<GroupDetail />} />
        <Route path='/addquiz' element={<AddQuiz />} />
        <Route path='/testlist' element={<TestList />} />
        <Route path="/answersheet/:id" element={<AnswerSheetPDF />} />
        <Route path="/addsection" element={<AddSection />} />
        <Route path="/viewtest" element={<ViewTests />} />
      </Routes>
    </>
  );
}

export default App;