import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import Blog from "./pages/blog";
import Login from "./pages/login";
import Register from "./pages/register";
import Layout from "./component/layout";
//import LoginPage from "./pages/LoginPage";  // already created

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-post" element={<Layout><Blog /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/*<Route path="/login" element={<LoginPage />} />*/}
        </Routes>
      </Router>
  );
}

export default App;
