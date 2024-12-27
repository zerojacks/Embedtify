import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/home'
// import SchemeList from './pages/SchemeList'
import TestPlanManager from './pages/TestPlanManager'
import { SocketProvider } from './Provider/webProvider';
import TestPlanCreate from './pages/TestPlanCreate';
import TestPlanInfo from './pages/TestPlanInfo';
import TestingInfo from './pages/TestingInfo';
import DevicesManager from './pages/DevicesManager';
import TestDetails from './pages/TestDetails';
import { WebSocketManager } from './Provider/WebSocketManager';
import ExecTestedPage from './pages/ExecTestedPage';

function App() {
  return (
    <Router>
      <WebSocketManager url="http://localhost:3000">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ExecTestedPage />} />
            <Route path="/test-plans" element={<TestPlanManager />} />
            <Route path="/test-plans/create" element={<TestPlanCreate />} />
            <Route path="/test-plans/:id" element={<TestPlanInfo />} />
            <Route path="/testing" element={<TestingInfo />} />
            <Route path="/devices" element={<DevicesManager />} />
            <Route path="/test-details/:id" element={<TestDetails />} />
            <Route path="/exec-tested" element={<ExecTestedPage />} />
            {/* Add more routes here */}
          </Route>
        </Routes>
      </WebSocketManager>
    </Router>
  )
}

export default App