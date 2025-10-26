import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import AppLayout from './layout/app-layout'
import Landing from './pages/landing'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import Onboarding from './pages/onboarding'
import JobPage from './pages/job'
import JobListing from './pages/jobListing'
import PostJobPage from './pages/postJob'
import SaveJobsPage from './pages/saveJobs'
import MyJobsPage from './pages/myJobs'
import { ThemeProvider } from './components/theme-provider'
import ProtectedRoute from './components/protected-route'
import JobAnalytics from './pages/JobAnalytics'
 const router=createBrowserRouter([

  {
    element:<AppLayout/>,
    children:[
      {
      path:'/',
      element:<Landing/>
      },
      {
      path:'/onboarding',
      element:
      <ProtectedRoute>
      <Onboarding/>
      </ProtectedRoute>
      },
      {
      path:'/jobs',
      element:
      <ProtectedRoute>
      <JobListing/>
      </ProtectedRoute>
      },
      {
      path:'/job/:id',
      element:
      <ProtectedRoute>
      <JobPage/>
      </ProtectedRoute>
      },
      {
      path:'/post-job',
      element:
      <ProtectedRoute>
      <PostJobPage/>
      </ProtectedRoute>
      },
      {
      path:'/saved-jobs',
      element:
      <ProtectedRoute>
      <SaveJobsPage/>
      </ProtectedRoute>
      },
      {
      path:'/my-jobs',
      element:
      <ProtectedRoute>
      <MyJobsPage/>
      </ProtectedRoute>
      },
       {
      path:'/job-analytics',
      element:
      <ProtectedRoute>
      <JobAnalytics/>
      </ProtectedRoute>
      }


    ]
  }
 ])

function App() {
 
  return(
    
       <RouterProvider router={router}/>
   
  )
}

export default App
