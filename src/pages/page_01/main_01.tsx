import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './../../index.css'
import Page01 from './page_01'

createRoot(document.getElementById('page_01')!).render(
  <StrictMode>
    <Page01 />
  </StrictMode>,
)
