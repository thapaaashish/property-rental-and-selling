import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import About from './pages/About'
import Profile from './pages/Profile'
import Header from './components/Header'
import VerifyEmail from './pages/VerifyEmail'
import CitySection from './components/CitySection'
import AddListing from './pages/AddListing'
import ForgotPassword from './pages/ForgotPassword'


export const App = () => {
  return (
    <BrowserRouter>
    <Header />
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/sign-in' element={<SignIn/>}></Route>
      <Route path='/forgot-password' element={<ForgotPassword/>}></Route>
      <Route path='/sign-up' element={<SignUp/>}></Route>
      <Route path='/verify-email' element={<VerifyEmail/>}></Route>
      <Route path='/about' element={<About/>}></Route>
      <Route path='/profile' element={<Profile/>}></Route>
      <Route path='/add-listing' element={<AddListing/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}
export default App