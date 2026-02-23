import React from 'react'
import './home.css'
import Header from '../../components/header/header'
import FeaturedCategories from '../../components/FeaturedCategories/featured-categories'
import FoodDisply from '../../components/FoodDisplay/FoodDisply'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
  return (
    <div>
      <Header/>
      <FeaturedCategories/>
      <FoodDisply category="All"/>
      <AppDownload/>
    </div>
  )
}

export default Home