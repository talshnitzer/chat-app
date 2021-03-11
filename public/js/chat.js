const socket = io()

//elements
const $messageForm = document.querySelector('#message-form') //the $ is a convention for a var that is an elemnt from the DOM
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
//getting the username and room from the url query
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) //qs lib parse the query string from the url, that we get in the global location.search, and return an object with the query keys as the object props

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the last/new message
    const newMessageStyles = getComputedStyle($newMessage) //the global getComputedStyle is made available by the browser.we use it to extract the margin bottom of new message
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) //parse string to a number
    const newMessageHeight = $newMessage.offsetHeight +newMessageMargin

    //Visible height of the messages area (the messages we can see)
    const visibleHeight = $messages.offsetHeight

    // Height of messages container - the total height we can scroll through
    const containerHeight = $messages.scrollHeight

    // how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight//the amount of space we scrolled from the top

    if (containerHeight - newMessageHeight <= scrollOffset) { // were we at the bottom before the last(new) message was added? if yes so we are going to autoscroll
        $messages.scrollTop = $messages.scrollHeight //push us to the bottom
    }
}

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (position) => {
    console.log(position);
    const html = Mustache.render(locationTemplate,{
        username: position.username,
        url: position.url,
        createdAt: moment(position.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled') //disable the form once it'sbeen submitted

    //acknowledgement requires changes on the client and the server.
    // whoever is emitting the event sets up a callback function.
    //Whoever is receiving the event receives a callback function that it needs to call.
    //it could optionally send data back and forth.

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => { //we provide (with rhe event) abunch of args. the last arg is a function-
        //This is going to run when the event is acknowledged
        $messageFormButton.removeAttribute('disabled')//re-enable the form once the message event is acknoledged
        $messageFormInput.value = ''
        $messageFormInput.focus() //to move the cursor inside the input dialog

        if (error) {
            return console.log(error);
        }

        console.log('Message delivered!');
    })
})

$sendLocation.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared!');
        })

    })
})

socket.emit('join', {username, room}, (error) => {
    //callback for acknowlegment form server. if something goes wrong the client get here the error and can show the message to the user
    if (error) {
        alert(error)
        location.href = '/'
    }
})
