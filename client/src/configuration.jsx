/**
 * This file is for the Configuration page.
 */

import Navbar from './partials/navbar';
import Footer from './partials/footer';
import { useNavigate } from 'react-router-dom';

import { POST_NEW_USER_ADDRESS } from "./server_calls";
import User from "./user_info";

/**
 * Variable to store the state of the configuration form (not currently used)
 */

/**
 * Creates a form elem for text
 * @param {label, id} props arguments for the form elem label and id
 */
function FormElemText(props) {
    return <div className='p-2'>
        <div className='p-2'>
            <input required className='w-full h-12 border border-gray-800 rounded px-3 font-medium' type="text" placeholder={props.label} id={props.id}/><br></br>
        </div>
    </div>
}

/**
 * Creates a radio button selector component
 * @param {arr, name} props array with the radio button options and name for the name of the radio button
 */
function FormElemRadio(props) {
    return <div className='p-2'>
        {props.arr.map(option => {
            return <div className='p-2'>
                <input required type='radio' id={option} name={props.name}/>
                <label className='pl-2 font-medium text-xl' for={option}>{option}</label><br></br>
            </div>
        })}
    </div>
}

/**
 * Creates the configuration form for the webpage.
 */
function ConfigForm() {
    const userTypes = ['Student', 'Teacher', 'Organizer', 'Admin']

    const navigate = useNavigate();

    // lambda function to ensure user input is valid and direct form submission to either
    // events page or back to this page on failure
    const submitForm = async event => {
        event.preventDefault();
        
        const name = event.target["name"].value.trim();
        const username = event.target["username"].value.trim();
        const detail = event.target["detail"].value.trim();
        var type = null;
        for(let i = 0; i < userTypes.length; i++) {
            if(event.target[userTypes[i]].checked) {
                type = event.target[userTypes[i]].id;
                break;
            }
        }

        const nameBool = (name.length > 0);
        const usernameBool = (username.length > 0);
        const detailBool = (detail.length > 0);
        const typeBool = type != null;

        if(!nameBool || !usernameBool || !detailBool || !typeBool) {
            alert('Please enter non-whitespace or empty values for all inputs');
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                { 
                    'name': name,
                    'username': username,
                    'detail': detail,
                    "type": type
                }
            )
        };
        
        //this needs a better timeout or somethinge else
        const response = await fetch(POST_NEW_USER_ADDRESS, requestOptions);
        const json = await response.json();
        console.log(json);
        const user = User.from_json(json);
        console.log(user);

        let dataString = JSON.stringify(user);
        
        if (user != null) {
            navigate(`/events?user=${dataString}`) 
        }  else {
            alert('Server error: failed to create new user');
        } 
    };
    
    return <div className = 'flex flex-col bg-white w-[30%] min-w-[475px] shadow-xl mt-10 rounded-lg p-8 text-black border-2 border-secondary'>
        <h1 className='text-4xl font-medium text-center pb-5'>Your Settings</h1>
        <form onSubmit={submitForm} className='flex w-full'>
            <div className='flex flex-col items-center w-full'>
                <div className="flex flex-row w-full">
                    <div className="flex flex-col w-[60%]">
                        <FormElemText id='name' label='Name'/>
                        <FormElemText id='username' label='Username'/>
                        <FormElemText id='detail' label='Fun Fact about You'/>
                    </div>
                    <div className="flex items-center pl-5 w-[40%]">
                        <div className="flex flex-col">
                            <h1 className="text-black text-2xl font-normal pb-2">User Type</h1>
                            <div className="bg-primary rounded-lg text-white">
                                <FormElemRadio arr={userTypes} name='UserType'/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex items-center  border border-secondary rounded px-3 my-3"></div>

                <div className='p-2 w-full items-center'>
                    <button type="submit" className='btn btn-outline-danger btn-block bg-secondary hover:brightness-75 rounded-full w-full' style={{ marginTop: '0.5rem' }}>
                        <h1 className='text-xl font-medium text-white p-4'>Save changes</h1>
                    </button>
                </div>
            </div>
        </form>
    </div>;
}

/**
 * Creates the configuration webpage.
 */
function Configuration() {
    return (
    <div className='flex flex-col bg-split justify-between h-screen w-screen'>
        <Navbar />
        <div className = 'flex flex-col items-center'>
            <ConfigForm /> 
        </div>
        <Footer />
    </div>
    );
}

export default Configuration;