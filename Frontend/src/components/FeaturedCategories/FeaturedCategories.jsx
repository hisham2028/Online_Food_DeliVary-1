import React from 'react'
import { Link } from 'react-router-dom'
import { menu_list } from '../../assets/assets'
import './featured-categories.css'

const FeaturedCategories = () => {
  return (
    <div className='featured-categories'>
      <h2>Popular Categories</h2>
      <div className="featured-categories-list">
        {menu_list.map((item, index) => (
          <Link to='/menu' key={index} className="featured-category-item">
            <img src={item.menu_image} alt={item.menu_name} />
            <p>{item.menu_name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default FeaturedCategories
