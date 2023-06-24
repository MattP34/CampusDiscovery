class Event {
    constructor(id, name, description, location, time, hasPermissions, hostName, capacity, invite_only, attending, open, user_attending, invited, coordinates) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.time = new Date(time);
        if(hostName!=null) {
            this.hostName = hostName;
        } else {
            this.hostName = "N/A";
        }
        this.hasPermissions = hasPermissions;
        this.capacity = capacity;
        this.invite_only = invite_only;
        this.attending = attending;
        this.open = open;
        this.user_attending = user_attending;
        this.invited = invited;
        this.conflict = false;
        this.coordinates = coordinates;
    }

    getStringTime() {
        var date = this.time;
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        var hh = date.getHours();
        var m = date.getMinutes();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        if (hh < 10) {
            hh = '0' + hh;
        }
        
        if (m < 10) {
            m = '0' + m;
        }
            
        return yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + m;
    }

    static from_json(json) {
        if(
            "id" in json &&
            "name" in json &&
            "description" in json &&
            "location" in json &&
            "time" in json &&
            "hasPermissions" in json &&
            "hostName" in json &&
            "capacity" in json &&
            "invite_only" in json &&
            "attending" in json &&
            "open" in json &&
            "user_attending" in json &&
            "invited" in json &&
            "coordinates" in json
        ) {
            var event = new Event(
                json["id"],
                json["name"],
                json["description"],
                json["location"],
                json["time"],
                json["hasPermissions"],
                json["hostName"],
                json["capacity"],
                json["invite_only"],
                json["attending"],
                json["open"],
                json["user_attending"],
                json["invited"],
                json["coordinates"]
            );
            return event;
        }
        return null;
    }
}

export default Event;