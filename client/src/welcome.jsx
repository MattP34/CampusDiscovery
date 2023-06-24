/**
 * File for the welcome page.
 */

import Navbar from './partials/navbar';
import Footer from './partials/footer';

/**
 * Creates the welcome page of the website.
 */
function Welcome() {
  return (
    <div className="flex flex-col justify-between h-screen">
      <Navbar />

      <div className="flex flex-row mt-24">
        <div className="bg-white w-1/2 flex flex-col items-center px-12 mt-44">
          <div>
            <h1 className="text-5xl font-medium pb-24 text-center">Welcome to the Georgia Tech Campus Discovery Service! </h1>
          </div>
          <div>
            <a href="./configuration" className="text-center w-90 bg-primary hover:bg-secondary rounded-full py-4 px-10 font-bold text-lg text-white">Get Started &nbsp;&nbsp;&rarr;</a>
          </div>
        </div>
        <div className="w-1/2">    
          <img src={require('./resources/Friend_Group.jpg')} className="pr-2" alt='Created by pch.vector on Freepik'/>
        </div>
      </div>


      <div className="">
        <Footer />
      </div>
    </div>

  );
}

export default Welcome;