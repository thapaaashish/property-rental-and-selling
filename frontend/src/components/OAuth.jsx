import React from 'react'
import { FcGoogle } from 'react-icons/fc';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase"; 
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';


const OAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider);
            
            const res = await fetch("/backend/auth/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: result.user.displayName,
                    email: result.user.email,
                    photo: result.user.photoURL,
                }),
            });

            const data = await res.json();

            dispatch(signInSuccess(data));
            navigate("/");         

            
        } catch (error) {
            console.log('Could not sign in with Google', error);
        }
    };
      
    

  return (
    <button onClick={handleGoogleClick} className="cursor-pointer hover:bg-gray-400 hover:text-white flex items-center justify-center w-full bg-gray-200 text-gray-700 p-2 rounded mb-4">
    <FcGoogle className="mr-2 text-xl" /> Sign in with Google
    </button>
  )
}

export default OAuth;