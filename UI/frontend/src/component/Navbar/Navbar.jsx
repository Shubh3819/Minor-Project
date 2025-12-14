import React from 'react'
import "./navbar.scss"
function Navbar() {
    return (
        <nav className="navbar">
          <div className="icon">
            <img src="./images/quake.jpg" alt="" />
            <span>Eathquake prediction</span>
          </div>
          <ul className="navbar-menu">
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      );
    }

    
export default Navbar
