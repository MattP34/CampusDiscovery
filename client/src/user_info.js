class User {
    constructor(id, name, username, detail, type, events) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.detail = detail;
        this.type = type;
        this.events = events;
    }

    static from_json(json) {
        if(
            "id" in json &&
            "name" in json &&
            "username" in json &&
            "type" in json &&
            "detail" in json
        ) {
            var user = new User(
                json["id"],
                json["name"],
                json["username"],
                json["detail"],
                json["type"],
                json["events"]
            );
            return user;
        }
        return null;
    }
}

export default User;