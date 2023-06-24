/**
 * This is a component for the top navigate bar for each webpage
 */

function Navbar() {
    return (
      
        <nav className="bg-white border-gray-200 px-2 py-2.5">
            <div className="container flex flex-wrap justify-between items-center mx-auto">
                <a href="http://localhost:3000/" className="flex items-center">
                    <img src={require('../resources/GT_Logo.png')} className="mr-3 h-14 border-r-[3px] border-solid border-primary pr-2" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap">Campus Discovery Service</span>
                </a>
                <div className="block w-auto" id="navbar-default">
                <ul className="flex flex-row p-4 mt-0 rounded-lg space-x-8 text-md font-medium">
                    <li>
                        <a href="http://localhost:3000/" className="block rounded bg-transparent hover:text-secondary p-0">Home</a>
                    </li>
                    <li>
                        <a href="#" className="block text-gray-700 rounded hover:text-secondary p-0">About</a>
                    </li>
                    <li>
                        <a href="#" className="block text-gray-700 rounded hover:text-secondary p-0">Contact</a>
                    </li>
                </ul>
                </div>
            </div>
        </nav>
  
    );
}

export default Navbar;