import React from 'react'
import './explore-menu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({category,setCategory}) => { 
  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Popular Categories</h1>
      <div className="scroll-wrapper">
        <div className="explore-menu-list">
          {/* Added (item, index) parameters to the map function */}
          {menu_list.concat(menu_list).map((item, index) => {
            return (
              <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={item.menu_name + index} className="explore-menu-list-item">
                <img className={category===item.menu_name?"active":""} src={item.menu_image} alt={item.menu_name} />
                <p>{item.menu_name}</p>
              </div>
            )
          })}
        </div>
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu // Updated export name