// File for making the events page.

import './index.css'
import Navbar from './partials/navbar';
import Footer from './partials/footer';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCircleRight, faCircleLeft, faClock, faFilter, faBreadSlice } from '@fortawesome/free-solid-svg-icons'
import { GET_USERS_EVENTS, POST_NEW_EVENT, DELETE_EVENT, EDIT_EVENT, RSVP_FOR_EVENT, DELETE_RSVP, DELETE_INVITED, ADD_INVITED, USER_RSVP } from './server_calls';
import Event from './event_info';
import User from './user_info';
import { applyFilters, CapacityFilter, NameFilter, OpenFilter, OpeningsFilter, TimeFilter } from './filters';
import 'flowbite-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

function EventInput(props) {
    return <div className='p-2 w-full'>
        <div className='p-2'>
            <input required className='w-full h-12 border border-gray-800 rounded px-3 font-medium' type="text" placeholder={props.value} id={props.value}/>
        </div>
    </div>
}

function PageBtns({rHide, lHide, eventManager}) {
    if (rHide && lHide) {
        return <div className='flex flex-row px-4 text-3xl w-full justify-center'>
            <button className="px-2 invisible" onClick={() => EventManager.pageDown(eventManager)} id="lPage"><FontAwesomeIcon icon={faCircleLeft}/></button>
            <button className="px-2 invisible" onClick={() => EventManager.pageUp(eventManager)} id="rPage"><FontAwesomeIcon icon={faCircleRight}/></button>  
        </div>
    }   else if (rHide) {
        return <div className='flex flex-row px-4 text-3xl w-full justify-center'>
            <button className="px-2" onClick={() => EventManager.pageDown(eventManager)} id="lPage"><FontAwesomeIcon icon={faCircleLeft} /></button>
            <button className="px-2 invisible" onClick={() => EventManager.pageUp(eventManager)} id="rPage"><FontAwesomeIcon icon={faCircleRight}/></button>  
        </div>
    }   else if (lHide) {
        return <div className='flex flex-row px-4 text-3xl w-full justify-center'>
            <button className="px-2 invisible" onClick={() => EventManager.pageDown(eventManager)} id="lPage" ><FontAwesomeIcon icon={faCircleLeft}/></button>
            <button className="px-2" onClick={() => EventManager.pageUp(eventManager)} id="rPage"><FontAwesomeIcon icon={faCircleRight}/></button>  
        </div>
    }   
    
    return <div className='flex flex-row px-4 text-3xl w-full justify-center'>
        <button className="px-2" onClick={() => EventManager.pageDown(eventManager)} id="lPage"><FontAwesomeIcon icon={faCircleLeft}/></button>
        <button className="px-2" onClick={() => EventManager.pageUp(eventManager)} id="rPage"><FontAwesomeIcon icon={faCircleRight}/></button>  
    </div>
}

function RSVPList({user_list, attending_status}) {
    return <div className="flex flex-col justify-center w-full">
        <h3 className='flex w-full'>{attending_status}</h3>
        <select className="appearance-none w-auto max-w-[50%] overflow-scroll mx-3 text-gray-600" size="3" multiple disabled>
            {
                user_list.map((user) => {
                    return <option value={user.id}>{user.name}</option>
                })
            }
        </select>
    </div>
}

function RSVPListMap({user_list, attending_status}) {
    return <div className="flex flex-col justify-center w-full">
        <h3 className='flex w-full'>{attending_status}</h3>
        <select className="appearance-none w-auto max-w-[50%] overflow-scroll mx-3 text-gray-600" size="3" multiple disabled>
            {
                user_list.map((user) => {
                    return <option value={user.id} className="text-xs">{user.name}</option>
                })
            }
        </select>
    </div>
}

class RSVPEdit extends React.Component {
    constructor(props) {
        super(props);
        this.formReference = React.createRef();
        this.buttonClickHandler = this.buttonClickHandler.bind(this);
    }

    buttonClickHandler() {
        var form = this.formReference.current;
        var options = form.options;
        var delete_users = [];
        for(let i = 0; i < options.length; i++) {
            if(options[i].selected) {
                delete_users.push(options[i].value);
            }
        }
        EventManager.deleteRSVP(this.props.eventManager, this.props.event, delete_users);
    }

    render() {
        return <div className="flex flex-col w-auto max-w-[30%] mx-3">
            <h3>{this.props.attending_status}</h3>
            <select ref={this.formReference} id="delete_user" className="appearance-none w-full" size="3" multiple>
                {
                    this.props.user_list.map((user) => {
                        return <option value={user.id}>{user.name}</option>
                    })
                }
            </select>
            <button onClick={ this.buttonClickHandler } type="button" className="mt-1 p-1 border-2 border-black shadow-sm rounded-lg">Remove</button>
        </div>
    }
}

class InviteEdit extends React.Component {
    constructor(props) {
        super(props);
        this.formReference = React.createRef();
        this.searchReference = React.createRef();
        this.deleteUsersHandle = this.deleteUsersHandle.bind(this);
        this.searchUserHandle = this.searchUserHandle.bind(this);
    }

    deleteUsersHandle() {
        var options = this.formReference.current.options;
        var delete_users = [];
        for(let i = 0; i < options.length; i++) {
            if(options[i].selected) {
                delete_users.push(options[i].value);
            }
        }
        EventManager.deleteInvited(this.props.eventManager, this.props.event, delete_users);
    }

    searchUserHandle() {
        var input = this.searchReference.current;
        var username = input.value;
        username = username.trim();
        EventManager.addInvited(this.props.eventManager, this.props.event, username);
    }

    render() {
        return <div className="flex flex-col justify-center">
            Edit Invited Users:
            <div className="flex flex-col w-auto max-w-[50%] mx-auto">
                <select ref={this.formReference} className="appearance-none w-full" size="3" multiple>
                    {
                        this.props.invited_list.map((user) => {
                            return <option value={user.id}>{user.name}</option>
                        })
                    }
                </select>
                <button type="button" onClick={this.deleteUsersHandle} className="mt-1 p-1 border-2 border-black shadow-sm rounded-lg">Remove</button>
            </div>
            <div>
                <div className='flex justify-center p-2 w-full'>
                    <div className='p-2'>
                        <div className="w-fit h-full border border-gray-800 rounded-lg overflow-hidden">
                            <input required ref={this.searchReference} className="px-3 font-medium border-none " type="text" placeholder="Invite User (username)" id="inviteUser"/>
                            <button type="button" onClick={this.searchUserHandle} className="bg-primary text-white h-full px-2 overflow-hidden">Invite</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

function EventCard({event, num, eventManager}) {
    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showRSVP, setShowRSVP] = useState(false);

    let defaultTime = event.getStringTime(); 

    const [location, setLocation] = useState(1);

    async function editEventFunc(location, clickEvent) {
        clickEvent.preventDefault();
        const name = clickEvent.target["title"].value.trim();
        const locationStr = location.label;
        const time = clickEvent.target["time"].value.trim();
        const description = clickEvent.target["description"].value.trim();

        const nameBool = (name.length > 0);
        const locationBool = (locationStr.length > 0);
        const timeBool = (time.length > 0);

        if(!nameBool || !locationBool || !timeBool) {
            alert('Invalid Event Parameters');
            return;
        }

        const placeId = location.value.place_id;
        var coordinates = {
            latitude: 0,
            longitude: 0
        };
        
        if(placeId == null) {
            alert("Not a valid place");
            return;
        }
        try {
            const requestOptions = {
                method: 'GET',
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
                },
            };
            //this needs a better timeout or something else
            const response = await fetch(
                "https://maps.googleapis.com/maps/api/geocode/json?place_id=" +
                    placeId + "&key=AIzaSyDJcijVY9BsYKSn_nK8zDkPGHqbUmeRKAg", 
                requestOptions);
            const json = await response.json();
            if(json == null || json.results.length == 0) {
                alert("Invalid location");
                return;
            }
            coordinates.latitude = json.results[0].geometry.location.lat;
            coordinates.longitude = json.results[0].geometry.location.lng;
            EventManager.editEvent(
                eventManager,
                event,
                name,
                locationStr,
                time,
                description,
                coordinates
            );
        setShowEdit(false);
        } catch(err) {
            console.log(err);
            alert('Failed to get location');
            return;
        }
        
        
    }

    const editEventFunc2 = editEventFunc.bind(null, location);
    
    return <div className='flex flex-col h-[10%]'>
        <div className="h-full rounded-md border-[2px] border-solid border-primary flex flex-row justify-between my-2" key={num}>
            <div className="flex justify-between cursor-pointer" onClick={() => setShowView(true)}>
                <div className="p-2 text-2xl text-primary font-bold self-baseline"> {event.name} </div>
            </div>
            <div className="flex flex-row">
                {
                    event.open ?
                    <div className="flex justify-center items-center z-40 px-3">
                        <button className="p-2 px-4 rounded-full border-[3px] border-secondary font-bold text-secondary" onClick={() => setShowRSVP(true)}>RSVP</button>
                    </div>: null
                }
                {
                    event.hasPermissions ? <div className="flex justify-center items-center z-40">
                        <button className="p-2" onClick={() => setShowDelete(true)}><FontAwesomeIcon icon={faTrash} /></button>
                        <button className="p-2" onClick={() => setShowEdit(true)}><FontAwesomeIcon icon={faEdit} /></button>
                    </div>: null
                } 
            </div>
        </div>
            {
                showDelete ? <div id="deleteModal" tabIndex="-1" className="overflow-y-auto overflow-x-hidden fixed left-1/2 top-1/2 translate-y-[-18%] translate-x-[-20%] inset-x-0 z-50 inset-0 h-full">
                    <div className="relative p-4 w-full max-w-md h-full md:h-auto">
                        <div className="relative bg-white rounded-lg shadow ">
                            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center " onClick={() => setShowDelete(false)}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" cliprule="evenodd"></path></svg>
                            </button>
                            <div className="p-6 text-center">
                                <svg className="mx-auto mb-4 w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <h3 className="mb-5 text-lg font-normal text-gray-500">Are you sure you want to delete this event?</h3>
                                <form className="text-white inline-flex items-center px-5 py-2.5 text-center mr-2">
                                    <button onClick={() => {
                                        EventManager.deleteEvent(
                                            eventManager,
                                            event
                                        );
                                        setShowDelete(false);
                                    }} type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                                        Yes, I'm sure
                                    </button>
                                </form>
                                <button onClick={() => setShowDelete(false)} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10">No, cancel</button>
                            </div>
                        </div>
                    </div>
                </div> : null
            }
            {
                showEdit ? <div id="editModal" tabindex="-1" aria-hidden="true" className="overflow-y-auto overflow-x-hidden fixed left-1/2 top-1/2 translate-y-[-49.5%] translate-x-[-35%] inset-x-0 z-50 inset-0 h-full">
                    <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
                        <div className="relative bg-white rounded-lg shadow-xl">
                            <div className="flex justify-between items-start p-4 py-2 rounded-t border-b">
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    Edit Event Information
                                </h3>
                                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={() => setShowEdit(false)}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                </button>
                            </div>
                            <form onSubmit={editEventFunc2} id="confirmation-form" className="mt-1">
                                <div className="p-6 space-y-4">
                                    <div className="text-gray-600 py-1">
                                        Event Title: <input type="text" id="title" name="title" className="w-full h-12 border border-gray-800 rounded px-3" placeholder="title" defaultValue={event.name} required />
                                    </div>
                                    <div className="text-gray-600 py-1">
                                        Description: <input type="text" id="description" name="description" className="w-full h-12 border border-gray-800 rounded px-3" placeholder="description" defaultValue={event.description} required />
                                    </div>
                                    <div className="text-gray-600 py-1">
                                        Location: <GooglePlacesAutocomplete apiKey="AIzaSyDJcijVY9BsYKSn_nK8zDkPGHqbUmeRKAg" selectProps={{ location, onChange: setLocation, defaultInputValue: event.location}} id="location"/>
                                    </div>
                                    <div className="text-gray-600 py-1">
                                        Time: <input type="datetime-local" id="time" name="time" className="w-full h-12 border border-gray-800 rounded px-3" defaultValue={ defaultTime } required />
                                    </div>
                                    <div className="text-gray-600 py-1">
                                        RSVPs: <br />
                                        <div className="flex flex-row justify-center w-full">
                                            <RSVPEdit user_list={event.attending.attending} attending_status={"Attending"} eventManager={eventManager} event={event}/>
                                            <RSVPEdit user_list={event.attending.undecided} attending_status={"Undecided"} eventManager={eventManager} event={event}/>
                                            <RSVPEdit user_list={event.attending.notAttending} attending_status={"Not Attending"} eventManager={eventManager} event={event}/>
                                        </div> <br />
                                        {event.invite_only ? <InviteEdit invited_list={event.invited} event={event} eventManager={eventManager}/> : null}
                                    </div>
                                </div>

                                <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200">
                                    <button type="submit" id="confirmEditsButton" className="text-white bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Confirm</button>
                                    <button onClick={() => setShowEdit(false)} type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div> 
                </div> : null
            }

            {
                showView ? <div id="viewModal" tabIndex="-1" className="overflow-y-auto overflow-x-hidden fixed left-1/2 top-1/2 translate-y-[-37.5%] translate-x-[-30%] inset-x-0 z-50 inset-0 h-full">
                    <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
                        <div className="relative bg-white rounded-lg shadow">
                            <div className="flex justify-between items-start p-4 rounded-t border-b">
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    View Event Information
                                </h3>
                                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={() => setShowView(false)}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="text-gray-600 py-1">
                                    Event Name: <span className="text-primary">{ event.name }</span>
                                </div>
                                <div className="text-gray-600 py-1">
                                    Host: <span className="text-primary">{ event.hostName }</span>
                                </div>
                                <div className="text-gray-600 py-1">
                                    Description: <span className="text-primary">{ event.description }</span>
                                </div>
                                <div className="text-gray-600 py-1">
                                    Location: <span className="text-primary">{ event.location }</span>
                                </div>
                                <div className="text-gray-600 py-1">
                                    Capacity: <span className="text-primary">{ event.attending.attending.length } / { event.capacity + ((event.open)?" (Open)": " (Closed)") }</span>
                                </div>
                                <div className="text-gray-600 py-1">
                                    Time: <span className="text-primary">{ event.time.toString() }</span>
                                </div>
                                <div className="text-gray-600 py-1">
                                    RSVP: 
                                </div>
                                <div className="text-gray-600 py-1">
                                    <div className="flex flex-row justify-center w-full">
                                        <RSVPList user_list={event.attending.attending} attending_status={"Attending"}/>
                                        <RSVPList user_list={event.attending.undecided} attending_status={"Undecided"}/>
                                        <RSVPList user_list={event.attending.notAttending} attending_status={"Not Attending"}/>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200">
                                <button onClick={() => setShowView(false)} type="button" className="text-white bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Ok</button>
                            </div>
                        </div>
                    </div>
                </div>  : null
            }
            {
                showRSVP ? <div id="rsvpModal" tabIndex="-1" className="overflow-y-auto overflow-x-hidden fixed left-1/2 top-1/2 translate-y-[-30%] translate-x-[-30%] inset-x-0 z-50 inset-0 h-full">
                    <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
                        <div className="relative bg-white rounded-lg shadow">
                            <div className="flex justify-between items-start p-4 rounded-t border-b">
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    Edit RSVP
                                </h3>
                                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={() => setShowRSVP(false)}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <select form="editRSVPForm" name="rsvp" id="rsvp" className="w-full h-12 border border-gray-800 rounded px-3" required>
                                    {(event.user_attending != "Attending") ? <option type="option" id="attending" name="attending" value="Attending">Attending</option> : <option type="option" id="attending" name="attending" value="Attending" selected>Attending (Current)</option>}
                                    {(event.user_attending != "Undecided") ? <option type="option" id="undecided" name="undecided" value="Undecided">Undecided</option> : <option type="option" id="undecided" name="undecided" value="Undecided" selected>Undecided (Current)</option>}
                                    {(event.user_attending != "NotAttending") ? <option type="option" id="notAttending" name="notAttending" value="NotAttending">Not Attending</option> : <option type="option" id="notAttending" name="NotAttending" value="notAttending" selected>Not Attending (Current)</option>}
                                    {(event.user_attending != "No RSVP") ? <option type="option" id="noRSVP" name="noRSVP" value="NoRSVP">No RSVP</option> : <option type="option" id="noRSVP" name="noRSVP" value="No RSVP" selected>No RSVP (Current)</option>}
                                </select>
                            </div>
                            <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200">
                                <form onSubmit={(clickEvent) => {
                                        clickEvent.preventDefault();
                                        var selector = clickEvent.target["rsvp"];
                                        EventManager.rsvpForEvent(eventManager, event, selector.options[selector.selectedIndex].value); //GET value for RSVP replace yes
                                        setShowRSVP(false);
                                    }} id="editRSVPForm">
                                    <button type="submit" className="text-white bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Ok</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>  : null
            }
    </div>;
}

function RSVPCard({event, eventManager}) {
    const [showRSVP, setShowRSVP] = useState(false);

    return <div className='flex flex-col max-h-[10%]'>
        <div className="h-full rounded-md border-[2px] border-solid border-primary flex flex-row justify-between my-2">
            <div className="flex justify-between cursor-pointer" onClick={() => setShowRSVP(true)}>
                <div className="p-2 text-auto text-primary font-bold self-baseline"> {event.name} </div>
            </div>
            <div className="flex flex-row items-center px-3">
                { event.conflict ? <FontAwesomeIcon icon={faClock} className="text-red-600" /> : null }
                {/* CAN WE ALERT ONCLICK TELLING WHICH EVENT IT HAS A CONFLICT WITH? */}
            </div>
        </div>

        {
            showRSVP ? <div id="rsvpModal" tabIndex="-1" className="overflow-y-auto overflow-x-hidden fixed left-1/2 top-1/2 translate-y-[-30%] translate-x-[-30%] inset-x-0 z-50 inset-0 h-full">
                <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
                    <div className="relative bg-white rounded-lg shadow">
                        <div className="flex justify-between items-start p-4 rounded-t border-b">
                            <h3 className="text-2xl font-semibold text-gray-900">
                                Edit RSVP
                            </h3>
                            <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={() => setShowRSVP(false)}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <select form="editRSVPForm" name="rsvp" id="rsvp" className="w-full h-12 border border-gray-800 rounded px-3" required>
                                {(event.user_attending != "Attending") ? <option type="option" id="attending" name="attending" value="Attending">Attending</option> : <option type="option" id="attending" name="attending" value="Attending" selected>Attending (Current)</option>}
                                {(event.user_attending != "Undecided") ? <option type="option" id="undecided" name="undecided" value="Undecided">Undecided</option> : <option type="option" id="undecided" name="undecided" value="Undecided" selected>Undecided (Current)</option>}
                                {(event.user_attending != "NotAttending") ? <option type="option" id="notAttending" name="notAttending" value="NotAttending">Not Attending</option> : <option type="option" id="notAttending" name="NotAttending" value="notAttending" selected>Not Attending (Current)</option>}
                                {(event.user_attending != "No RSVP") ? <option type="option" id="noRSVP" name="noRSVP" value="NoRSVP">No RSVP</option> : <option type="option" id="noRSVP" name="noRSVP" value="No RSVP" selected>No RSVP (Current)</option>}
                            </select>
                        </div>
                        <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200">
                            <form onSubmit={(clickEvent) => {
                                    clickEvent.preventDefault();
                                    var selector = clickEvent.target["rsvp"];
                                    EventManager.rsvpForEvent(eventManager, event, selector.options[selector.selectedIndex].value); //GET value for RSVP replace yes
                                    setShowRSVP(false);
                                }} id="editRSVPForm">
                                <button type="submit" className="text-white bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Ok</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>  : null}
    </div>
}

function EventPage({pageEvents, eventManager}) {
    return  pageEvents.map((event, index) => {
        return <EventCard event={event} num={index} eventManager={eventManager}/>
    })
}

function RSVPPage({rsvp_events,eventManager}) {
    /* WASN'T REALLY SURE HOW YOU DID THIS FOR THE EVENTPAGE FUNCTION */
    return <div className="flex flex-col">
        {
        rsvp_events.map((event) => {
            return <div><RSVPCard event={event} eventManager={eventManager}></RSVPCard></div>
        })}
    </div>
    
}

/* USE THIS TO GENERATE MARKERS */
function MapMarker({lat, long, event}) {
    return <Marker position={[parseFloat(lat), parseFloat(long)]}>
        <Popup>
        <div className="relative bg-white rounded-lg shadow p-2">
            <div >
                <div className="text-gray-600 py-1">
                    Event Name: <span className="text-primary">{ event.name }</span>
                </div>
                <div className="text-gray-600 py-1">
                    Host: <span className="text-primary">{ event.hostName }</span>
                </div>
                <div className="text-gray-600 py-1">
                    Description: <span className="text-primary">{ event.description }</span>
                </div>
                <div className="text-gray-600 py-1">
                    Location: <span className="text-primary">{ event.location }</span>
                </div>
                <div className="text-gray-600 py-1">
                    Capacity: <span className="text-primary">{ event.attending.attending.length } / { event.capacity + ((event.open)?" (Open)": " (Closed)") }</span>
                </div>
                <div className="text-gray-600 py-1">
                    Time: <span className="text-primary">{ event.time.toString() }</span>
                </div>
                <div className="text-gray-600 py-1">
                    RSVP: 
                </div>
                <div className="text-gray-600 py-1">
                    <div className="flex flex-row justify-center w-full text-xs">
                        <div className="w-[33%]">
                            <RSVPListMap user_list={event.attending.attending} attending_status={"Attending"} className="text-xs"/>
                        </div>
                        <div className="w-[33%]">
                            <RSVPListMap user_list={event.attending.undecided} attending_status={"Undecided"} />
                        </div>
                        <div className="w-[33%]">
                            <RSVPListMap user_list={event.attending.notAttending} attending_status={"Not Attending"} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </Popup>
    </Marker>
}

function MarkerGenerate({pageEvents, eventManager}) {
    return pageEvents.map((event) => {
        return <MapMarker event={event} lat={event.coordinates.latitude} long={event.coordinates.longitude}/>
    })
}

class EventManager extends React.Component {
    static numItemsPerPage = 10;

    constructor({eventsComp}) {
        super();
        this.state = {
            pageNum: 0,
            filter: false,
            mapMode: false
        };
        this.filterDefaults = {
            remainingSpots: null,
            availability: "all",
            name: null
        };
    }

    static pageUp(eventManager) {
        if(eventManager.state.pageNum + 1 >= eventManager.props.events.numElements) return;
        eventManager.setState({pageNum: eventManager.state.pageNum+1, filter: eventManager.state.filter});
    }

    static pageDown(eventManager) {
        if(eventManager.state.pageNum <= 0) return;
        eventManager.setState({pageNum: eventManager.state.pageNum-1, filter: eventManager.state.filter});
    }

    static deleteEvent(eventManager, event) {
        eventManager.props.eventsComp.deleteEvent(event);
    }

    static editEvent(eventManager, event, title, description, location, time, coordinates) {
        eventManager.props.eventsComp.editEvent(event, title, description, location, time, coordinates);
    }

    static rsvpForEvent(eventManager, event, status) {
        eventManager.props.eventsComp.RSVPForEvent(event, status);
    }

    static deleteRSVP(eventManager, event, delete_users) {
        eventManager.props.eventsComp.deleteRSVP(event, delete_users);
    }

    static deleteInvited(eventManager, event, delete_users) {
        eventManager.props.eventsComp.deleteInvited(event, delete_users);
    }

    static addInvited(eventManager, event, username) {
        eventManager.props.eventsComp.addInvited(event, username);
    }

    static addFilters(eventManager, filters) {
        eventManager.props.eventsComp.addFilters(filters);
    }

    static clearFilters(eventManager) {
        eventManager.props.eventsComp.clearFilters();
    }

    render() {
        const maxVal = (this.state.pageNum+1) * EventManager.numItemsPerPage;

        const events = this.props.events;
        
        var pageEvents = [];

        var rHide = false;
        var lHide = false;

        if (maxVal < events.length) {
            rHide = false;
        } else {
            rHide = true;
        }
        for (let i = 0; this.state.pageNum * EventManager.numItemsPerPage + i < events.length && i < EventManager.numItemsPerPage; i++) {
            pageEvents.push(events[this.state.pageNum * EventManager.numItemsPerPage + i]);
        }
        
        if (this.state.pageNum === 0) {
            lHide = true;
        }   else {
            lHide = false;
        }
        return <div className="flex flex-row w-[80%]">
            <div className="flex flex-col w-[80%] h-full border-2 border-dashed rounded-lg mx-4 p-2">
                <div>
                    <div className="flex flex-row justify-between">
                        <div className="text-gray-800 text-2xl font-medium pb-2">Events</div>
                        <label className="inline-flex relative items-center cursor-pointer">
                            <input type="checkbox" id="toggle" value="" className="sr-only peer" 
                                onClick={(clickEvent) => {
                                    this.setState({mapMode: clickEvent.target.checked});
                                }}/>
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Map View</span>
                        </label>
                        
                        <button onClick={() => this.setState({ filter: !this.state.filter })}><FontAwesomeIcon icon={faFilter}></FontAwesomeIcon></button>
                        {
                            this.state.filter ? <div id="filterModal" tabindex="-1" aria-hidden="true" className="overflow-y-auto overflow-x-hidden fixed left-1/2 top-1/2 translate-y-[-41%] translate-x-[27%] inset-x-0 z-50 inset-0 h-full">
                            <div className="relative p-4 w-[40%] max-w-2xl h-full md:h-auto">
                                <div className="relative bg-white rounded-lg shadow-xl">
                                    <div className="flex justify-between items-start p-4 py-2 rounded-t border-b">
                                        <h3 className="text-2xl font-semibold text-gray-900">
                                            Filter Events
                                        </h3>
                                        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={() => this.setState({ filter: false })}>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                        </button>
                                    </div>
                                    <form id="filter-form" className="mt-1" onSubmit={(clickEvent) => {
                                        clickEvent.preventDefault();
                                        const remSpots = clickEvent.target["remSpots"];
                                        const availability = clickEvent.target["availability"];
                                        const name = clickEvent.target["name"];
                                        var remSpotsVal = remSpots.value;
                                        var availVal = availability.options[availability.selectedIndex].value;
                                        var nameVal = name.value.trim();
                                        var filters = [];
                                        if(remSpotsVal.length > 0) {
                                            remSpotsVal = +remSpotsVal;
                                            filters.push(new OpeningsFilter(remSpotsVal));
                                            this.filterDefaults.remainingSpots = remSpotsVal;
                                        }
                                        this.filterDefaults.availability = availVal;
                                        switch(availVal) {
                                            case "all":
                                                filters.push(new OpenFilter(true, true));
                                                break;
                                            case "available":
                                                filters.push(new OpenFilter(true, false));
                                                break;
                                            case "unavailable":
                                                filters.push(new OpenFilter(false, true));
                                                break;
                                        }
                                        if(nameVal.length > 0) {
                                            this.filterDefaults.name = nameVal;
                                            filters.push(new NameFilter(nameVal));
                                        }
                                        this.setState({filter:false});
                                        EventManager.addFilters(this, filters);
                                    }}>
                                        <div className="p-6 space-y-4">
                                            <div className="text-gray-600 py-1">
                                                Minimum Remaining Spots <input type="number" min="0" id="remSpots" name="remSpots" className="w-full h-12 border border-gray-800 rounded px-3" defaultValue={this.filterDefaults.remainingSpots?this.filterDefaults.remainingSpots:"Remaining Spots"} />
                                            </div>
                                            <div className="text-gray-600 py-1">
                                                Event Availability:
                                                <select id="availability" name="availability" className="w-full h-12 border border-gray-800 rounded px-3" placeholder={this.filterDefaults.availability?this.filterDefaults.availability:"Availability"}>
                                                    <option value="all" selected={this.filterDefaults.availability === "all" ? "selected": null}>All</option>
                                                    <option value="available" selected={this.filterDefaults.availability === "available" ? "selected": null}>Available</option>
                                                    <option value="unavailable" selected={this.filterDefaults.availability === "unavailable" ? "selected": null}>Unavailable</option>
                                                </select>
                                            </div>
                                            <div className="text-gray-600 py-1">
                                                Name: <input type="text" id="name" name="name" className="w-full h-12 border border-gray-800 rounded px-3" defaultValue={this.filterDefaults.name?this.filterDefaults.name:null}/>
                                            </div>
                                        </div>
        
                                        <div className="flex p-6 space-x-2 rounded-b border-t border-gray-200 justify-between">
                                            <button type="submit" id="confirmFiltersButton" className="text-white bg-primary hover:brightness-75 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Apply</button>
                                            <button type="button" onClick={() => {
                                                EventManager.clearFilters(this)
                                                this.filterDefaults = {
                                                    remainingSpots: null,
                                                    availability: "All",
                                                    name: null
                                                };
                                                this.setState({filter:false});
                                            }} id="clearFiltersButton" className="text-white bg-secondary hover:brightness-75 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Clear Filters</button>
                                        </div>
                                    </form>
                                </div>
                            </div> 
                        </div> : null
                        }
                    </div>
                </div>
                { this.state.mapMode ? 
                    <div className="h-full w-full z-40">
                        <MapContainer center={[33.77578305473811, -84.39818714263777]} zoom={16} scrollWheelZoom={false} className="max-h-fit max-w-fit">
                            <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MarkerGenerate  pageEvents={pageEvents} eventManager={this} />

                        </MapContainer>
                    </div> :
                    <div className="h-full w-full">
                        <div className='h-full'>
                            <EventPage pageEvents={pageEvents} eventManager={this}/>
                        </div>
                        <div className='flex flex-row px-4 text-3xl w-full justify-center'>
                            <PageBtns rHide={rHide} lHide={lHide} eventManager={this}/>
                        </div>
                    </div>
                }
            </div>

            <div className='flex flex-col h-full w-[20%] border-2 border-dashed rounded-lg mr-4 p-2 overflow-scroll'>
                <div className="text-gray-800 text-2xl font-medium pb-2">RSVPs</div>
                <RSVPPage rsvp_events={this.props.rsvp_events} eventManager={this}/>
            </div>
        </div> 
    }
}

function CreateEvent(props) {

    const [location, setLocation] = useState(0);

    async function submitEvent(location, event) {
        event.preventDefault();
        const name = event.target["title"].value.trim();
        const locationStr = location.label;
        const time = event.target["time"].value.trim();
        const description = event.target["description"].value.trim();
        const capacityString = event.target["capacity"].value;
        const inviteOnlyString = event.target["inviteOnly"].value;
        const inviteOnly = inviteOnlyString == "yes";

        var capacity = null;
        if(capacityString != '') {
            capacity = +capacityString;
            if(capacity == NaN) {
                capacity = null;
            }
        }

        const nameBool = (name.length > 0);
        const locationBool = (locationStr.length > 0);
        const timeBool = (time.length > 0);
        const capacityBool = (capacity == NaN || capacity >= 1);

        if(!nameBool || !locationBool || !timeBool || !capacityBool) {
            alert('Invalid Event Parameters');
            return;
        }

        const placeId = location.value.place_id;
        var coordinates = {
            latitude: 0,
            longitude: 0
        };
        
        if(placeId == null) {
            alert("Not a valid place");
            return;
        }
        try {
            const requestOptions = {
                method: 'GET',
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
                },
            };
            
            //this needs a better timeout or something else
            const response = await fetch(
                "https://maps.googleapis.com/maps/api/geocode/json?place_id=" +
                    placeId + "&key=AIzaSyDJcijVY9BsYKSn_nK8zDkPGHqbUmeRKAg", 
                requestOptions);
            const json = await response.json();
            if(json == null || json.results.length == 0) {
                alert("Invalid location");
                return;
            }
            coordinates.latitude = json.results[0].geometry.location.lat;
            coordinates.longitude = json.results[0].geometry.location.lng;

        } catch(err) {
            console.log(err);
            alert('Failed to get location');
            return;
        }

        props.sendToServer.createEvent(name, locationStr, time, description, capacity, inviteOnly, coordinates);
    };

    const submitEvent2 = submitEvent.bind(null, location);


    return <div className="flex flex-col w-full">
        <div className="text-gray-800 text-2xl font-medium p-2 py-1" id="acctBtn">Create New Event</div>
        <form onSubmit={submitEvent2} className="flex flex-col p-2 w-full justify-center items-center" action="">
            <EventInput value="title"/>
            <EventInput value="description"/>
            <div className='p-2 w-full'>
                <div className='p-2 w-full border-gray-800'>
                    <div className="text-sm">location</div>
                    <GooglePlacesAutocomplete apiKey="AIzaSyDJcijVY9BsYKSn_nK8zDkPGHqbUmeRKAg" selectProps={{ location /* THIS IS WHAT HOLDS YOUR LOCATION VALUE */, onChange: setLocation }} id="location" defaultValue="location" />
                </div>
            </div>
            <div className='p-2 w-full'>
                <div className='p-2'>
                    <input required className='w-full h-12 border border-gray-800 rounded px-3 font-medium' type="number" placeholder="capacity" id="capacity"/>
                </div>
            </div>
            <div className='flex flex-row p-2 w-full'>
                <div className='p-2'>Invite Only: &nbsp;&nbsp;&nbsp;
                    <select id="inviteOnly" defaultValue="no">
                        <option value="yes">yes</option>
                        <option value="no">no</option>
                    </select> 
                </div>
            </div>
            <div className='p-2 w-full'>
                <div className='p-2'>
                    <input required className='w-full h-12 border border-gray-800 rounded px-3 font-medium' type="datetime-local" id="time"/>
                </div>
            </div>
            <button className='bg-primary hover:brightness-75 rounded-full w-[75%] max-h-[75px] mt-4 mx-auto text-center'>
                <h1 className='text-xl font-medium text-white p-4'>Create Event</h1>
            </button>
        </form>
    </div>
}

class EventsComp extends React.Component {
    constructor({user}) {
        super();
        this.user = User.from_json(user);
        this.state = {
            numEvents: 0,
            events: [],
            rsvp_events: [],
            filters: []
        }
        //let eventsRaw = [{title: "testName", host: "dash", description: "description", location: "location", time: "time"}, {title: "test2", host: "dash", description: "description", location: "location", time: "time"}, {title: "hey"}];
    }

    componentDidMount() {
        if(this.user != null) {
            this.addEvents();
            this.addRSVPEvents();
        }
    }

    async addEvents() {
        var userId = (this.user != null)?this.user.id:"";
        try {
            const requestOptions = {
                method: 'GET',
            };
            //this needs a better timeout or somethinge else
            const response = await fetch(
                GET_USERS_EVENTS + "?id=" + userId,
                requestOptions);
            const json = await response.json();
            const events_arr = json.events;
            var events_temp = [];
            for(let i = 0; i < events_arr.length; i++) {
                events_temp.push(Event.from_json(events_arr[i]));
            }
            this.setState({
                numEvents: events_temp.length,
                events:events_temp
            });
        } catch(err) {
            console.error("error getting events:" + err.message);
            this.setState({
                numEvents: 0,
                events: []
            });
        }
    }
    
    async addRSVPEvents() {
        var userId = (this.user != null)?this.user.id:"";
        try {
            const requestOptions = {
                method: 'GET',
            };
            //this needs a better timeout or somethinge else
            const response = await fetch(
                USER_RSVP + "?id=" + userId,
                requestOptions);
            const json = await response.json();
            const events_arr = json.events;
            var events_temp = [];
            for(let i = 0; i < events_arr.length; i++) {
                events_temp.push(Event.from_json(events_arr[i]));
            }
            // sort for time comparisons
            events_temp.sort((a,b) => a.time - b.time);
            for(let i = 0; i < events_temp.length - 1; i++) {
                console.log(events_temp[i + 1].time.getTime() - events_temp[i].time.getTime() < 1000*60*60);
                if(events_temp[i + 1].time.getTime() - events_temp[i].time.getTime() < 1000*60*60) {
                    events_temp[i].conflict = true;
                    events_temp[i + 1].conflict = true;
                }
            }
            this.setState({
                rsvp_events: events_temp
            });
        } catch(err) {
            console.error("error getting rsvp events:" + err.message);
            this.setState({
                numEvents: 0,
                rsvp_events: []
            });
        }
    }

    async createEvent(name, location, time, description, capacity, invite_only, coordinates) {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { 
                        'name': name,
                        'description': description,
                        'location': location,
                        "time": time,
                        "host": this.user,
                        "capacity": capacity,
                        "invite_only": invite_only,
                        "coordinates": coordinates
                    }
                )
            };
            
            //this needs a better timeout or something else
            const response = await fetch(POST_NEW_EVENT, requestOptions);
            const json = await response.json();
            
            var newEvent = Event.from_json(json);
            if (newEvent == null) {
                alert('Server error: failed to create new event');
            } else {
                window.location.reload(false);
            }
        } catch(err) {
            console.error(err.message);
            alert('Failed to create event');
        }
    }

    async editEvent(id, name, location, time, description, coordinates) {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    {
                        'id': id,
                        'name': name,
                        'description': description,
                        'location': location,
                        "time": time,
                        "editor": this.user.id,
                        "coordinates": coordinates
                    }
                )
            };
            
            //this needs a better timeout or something else
            const response = await fetch(EDIT_EVENT, requestOptions);
            const json = await response.json();
            if (json.status != "good") {
                alert('Server error: failed to edit event');
            } else {

                window.location.reload(false);
                alert("Event Edited Successfully");
            }
        } catch(err) {
            alert('Failed to create user');
        }
    }

    async deleteEvent(event) {
        try {
            const requestOptions = {
                method: 'DELETE'
            };
            
            await fetch(
                DELETE_EVENT + "?" + new URLSearchParams({
                    user_id: this.user.id,
                    event_id: event.id
                }),
                requestOptions
            );

            window.location.reload(false);
        } catch(err) {
            console.error(err.message);
            alert('Failed to delete event');
        }
    }

    async RSVPForEvent(event, status) {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    {
                        id: event.id,
                        status: status,
                        user: this.user.id
                    }
                )
            };
            
            //this needs a better timeout or something else
            const response = await fetch(RSVP_FOR_EVENT, requestOptions);
            const json = await response.json();
            if (json.status != "good") {
                alert('Server error: failed to edit event');
            } else {
                window.location.reload(false);
                alert("Event Edited Successfully");
            }
        } catch(err) {
            alert('Failed to rsvp user');
        }
    }

    async deleteRSVP(event, delete_users) {
        if(delete_users.length == 0) {
            alert('no users removed');
            return;
        }
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    {
                        id: event.id,
                        delete_users: delete_users,
                        user: this.user.id
                    }
                )
            };
            
            //this needs a better timeout or something else
            const response = await fetch(DELETE_RSVP, requestOptions);
            const json = await response.json();
            if (json.status != "good") {
                alert('Server error: failed to edit event');
            } else {
                window.location.reload(false);
                alert("Event Edited Successfully");
            }
        } catch(err) {
            alert('Failed to delete rsvp');
        }
    }

    async deleteInvited(event, delete_users) {
        if(delete_users.length == 0) {
            alert('no users removed');
            return;
        }
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    {
                        id: event.id,
                        delete_users: delete_users,
                        user: this.user.id
                    }
                )
            };
            
            //this needs a better timeout or something else
            const response = await fetch(DELETE_INVITED, requestOptions);
            const json = await response.json();
            if (json.status != "good") {
                alert('Server error: failed to edit event');
            } else {
                window.location.reload(false);
                alert("Event Edited Successfully");
            }
        } catch(err) {
            alert('Failed to delete user');
        }
    }

    async addInvited(event, username) {
        username = username.trim();
        if(username.length == 0) {
            alert("No username entered");
            return;
        }
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    {
                        id: event.id,
                        username: username,
                        user: this.user.id
                    }
                )
            };
            
            //this needs a better timeout or something else
            const response = await fetch(ADD_INVITED, requestOptions);
            const json = await response.json();
            if (json.status != "good") {
                alert(json.message);
            } else {
                window.location.reload(false);
                alert("Event Edited Successfully");
            }
        } catch(err) {
            alert('Failed to add user');
        }
    }

    addFilters(filters) {
        this.setState({
            filters: filters
        });
    }

    clearFilters() {
        this.setState({
            filters: []
        });
    }

    // Makes the event page.
    render() {
        var eventsTemp = [];
        for(let i = 0;  i < this.state.events.length; i++) {
            eventsTemp.push(this.state.events[i]);
        }
        var rsvp_events_temp = [];
        for(let i = 0;  i < this.state.rsvp_events.length; i++) {
            rsvp_events_temp.push(this.state.rsvp_events[i]);
        }
        
        return (
            <div className="flex flex-col h-screen w-screen">
                <Navbar />
            
                <div className="flex flex-row w-full h-full max-h-[88.5%] mt-5">
                    <div className="flex flex-col w-[20%] h-full border-2 border-dashed rounded-lg ml-4 px-2 justify-center items-center">
                        <div className="flex flex-col w-full h-full text-xl">
                            <div className="text-gray-800 text-2xl font-medium p-2" id="acctBtn">Account Summary</div>
                            <div className="text-gray-600 p-2 pl-10">
                                Name: <span className="text-primary">{ (this.user!=null)?this.user.name:"N/A" }</span>
                            </div>
                            <div className="text-gray-600 p-2 pl-10">
                                Username: <span className="text-primary">{ (this.user!=null)?this.user.username:"N/A" }</span>
                            </div>
                            <div className="text-gray-600 p-2 pl-10">
                                Fun Fact: <span className="text-primary">{ (this.user!=null)?this.user.detail:"N/A" }</span>
                            </div>
                            <div className="text-gray-600 p-2 pl-10">
                                Role: <span className="text-primary">{ (this.user!=null)?this.user.type:"N/A"}</span>
                            </div>
                            <div className="border-b-[1px] border-solid border-gray-300 mt-5 mb-5 w-full mr-4"></div>
                            <div>
                                <CreateEvent sendToServer={this}/>
                            </div>
                        </div>
                    </div>
                    <EventManager events={applyFilters(eventsTemp, this.state.filters)} eventsComp={this} rsvp_events={rsvp_events_temp}/>
                </div>

                <Footer />
            </div>
        )
    }
}

function Events() {
    const [searchParams] = useSearchParams();
    var user = User.from_json(JSON.parse(searchParams.get("user")));
    return <EventsComp user={user} />
}
 
export default Events;