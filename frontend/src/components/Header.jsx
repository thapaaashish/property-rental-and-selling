import React from 'react'
import { Link } from 'react-router-dom'
const Header = () => {
  return (
    <header className='bg-slate-200 shadow-md'>
<div className='flex justify-between '>
    <Link to="/">
    <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
        <span className='text-slate-500'>
            CodingClever
        </span>
        <span className=''>
            Estate
        </span>
    </h1>
    </Link>
    <ul className='flex gap-4'>
        <Link to="/">
        <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
        </Link>
        <Link to="/about">
        <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
        </Link>
        <Link to="/sign-in">
        <li className='text-slate-700 hover:underline'>Sign In</li>
        </Link>
    </ul>
</div>
    </header>
  )
}

export default Header