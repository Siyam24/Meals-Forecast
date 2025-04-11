import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Import the theme hook
import '../styles/Footer.css'; // Import the CSS file for footer styles

const Footer = () => {
  const { theme } = useTheme(); // Access the current theme

  return (
    <footer className={`footer ${theme}`}> {/* Add the theme class to the footer */}
      <span>All rights reserved 2024 by Meals Forecast</span>
    </footer>
  );
};

export default Footer;
