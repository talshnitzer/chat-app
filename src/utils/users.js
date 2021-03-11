const users = []

// addUser, removeUser, getUser, getUsersInRoom
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room) 
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id )

    if (index !== -1) {
        return users.splice(index, 1)[0] //splice allows us to remove items from an array by their index.
                                            //this function returns the removed items. in this case there will always ever be one item
    }
}

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if (existingUser) {
        return{
            error: 'Username is in use!'
        }
    }

    //Store user
    const user = { id, username, room}
    users.push(user)
    return { user }
}

module.exports = {
    getUsersInRoom,
    getUser,
    removeUser,
    addUser 
}