/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    colors: {
      'primary': '#B3A369',
      'secondary': '#003057',
      'grey': '#CCC',
      'white': "#FFFFFF",
    },
    extend: {
      backgroundImage: {
        'split': "linear-gradient(to bottom, #FFFFFF 60% , #B3A369 40%);"
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
