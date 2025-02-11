import React from 'react'
import { Link } from 'react-router-dom'
const Header = () => {
  return (
    <header className=' shadow-md p-4 border-b-gray-100'>
<div className='flex justify-between container mx-auto items-center'>
    <Link to="/">
    <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
        <span className='text-slate-500'>
            Property
        </span>
        <span className=''>
            Rental
        </span>
    </h1>
    </Link>
    <ul className='flex gap-4 space-x-4'>
        <Link to="/">
        <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
        </Link>
        <Link to="/about">
        <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
        </Link>
        <Link to="/sign-in">
        <li className=' hover:underline bg-black text-white px-4 py-1 rounded'>Sign In</li>
        </Link>
    </ul>
</div>
    </header>
  )
}

export default Header