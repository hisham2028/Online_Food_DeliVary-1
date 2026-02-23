import React, { useState } from 'react'
import './menu.css'
import ExploreMenu from '../../components/Explore-menu/explore-menu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisply'

const Menu = () => {
  const [category,setCategory] = useState("All");

  return (
    <div className="menu-page">
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
    </div>
  )
}

export default Menu
