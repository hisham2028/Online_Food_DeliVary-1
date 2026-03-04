import React from 'react'
import './home.css'
import Header from '../../components/header/header'
import FeaturedCategories from '../../components/FeaturedCategories/featured-categories'
import SpecialSections from '../../components/SpecialSections/SpecialSections'
import OurServices from '../../components/OurServices/OurServices'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
  return (
    <div id="top">
      <Header/>
      <FeaturedCategories/>
      <SpecialSections/>
      <div id="OurServices">
        <OurServices/>
      </div>
      <AppDownload/>
    </div>
  )
}

export default Home