import React from 'react'
import { Outlet } from 'react-router-dom'
import '../App.css'
import Header from '../components/Header'
const AppLayout
 = () => {
  return (
    <div>
        
        <div className='grid-background'></div>
        <main className='min-h-screen max-w-7xl mx-auto'>
            <Header/>
            <Outlet/>
        </main>
        <div className='p-10 text-center text-zinc-400 bg-gray-200 dark:bg-gray-800 mt-10'>
            Made with ❤️ by Eswar
        </div>
    </div>
  )
}

export default AppLayout
