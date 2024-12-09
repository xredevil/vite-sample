import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './../../index.css'
import Page02 from './page_02'

createRoot(document.getElementById('page_02')!).render(
  <StrictMode>
    <Page02 />
  </StrictMode>,
)
