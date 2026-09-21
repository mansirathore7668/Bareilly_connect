
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from './pages/Home';
import Business from './pages/Business';
import Categories from './pages/Categories';
import CategoryListing from './pages/CategoryListing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import BussinessDetails from "./pages/BusinessDetails";
import Favorites from "./pages/Favorites";
import AdminDashboard from "./pages/AdminDashboard";
import AISearch from "./pages/AISearch";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import AddBusiness from "./pages/AddBusiness";
import EditBusiness from "./pages/EditBusiness";
import Thanks from "./pages/Thanks";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/business" element={<Business />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:slug" element={<CategoryListing />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ai-search" element={<AISearch />} />
          <Route path="/ai" element={<Navigate to="/ai-search" replace />} />
          <Route path="/businesses" element={<Navigate to="/business" replace />} />
          <Route
            path="/business2"
            element={<Navigate to="/business" replace />}
          />
          <Route path="/business/:id" element={<BussinessDetails />} />
          <Route path="/add-business" element={<AddBusiness />} />
          <Route path="/business/:id/edit" element={<EditBusiness />} />
          <Route path="/thanks" element={<Thanks />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
