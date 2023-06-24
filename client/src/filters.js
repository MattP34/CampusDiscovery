export function applyFilters(events, filterArray) {
    var filteredEvents = events;
    for(let i = 0; i < filterArray.length; i++) {
        const boundFilter = filterArray[i].filter.bind(filterArray[i]);
        filteredEvents = filteredEvents.filter(boundFilter);
    }
    console.log(filteredEvents);
    return filteredEvents;
}

export class OpenFilter {
    constructor(allowOpen, allowClosed) {
        this.allowOpen = allowOpen;
        this.allowClosed = allowClosed;
    }

    filter(event) {
        return (event.open && this.allowOpen) || (!event.open && this.allowClosed);
    }
}

export class OpeningsFilter {
    constructor(openings) {
        this.openings = openings;
    }

    filter(event) {
        return event.capacity - event.attending.attending.length >= this.openings;
    }
}

export class TimeFilter {
    constructor(date) {
        this.date = date;
    }

    filter(event) {
        return event.time.getDate() == this.date.getDate() &&
            event.time.getMonth() == this.date.getMonth() &&
            event.time.getYear() == this.date.getYear();
    }
}

export class NameFilter {
    constructor(name) {
        this.name = name;
    }

    filter(event) {
        if(event.name.length < this.name.length) {
            return false;
        }
        const tempStr = event.name.substring(0,this.name.length);
        return tempStr === this.name;
    }
}