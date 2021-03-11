const socket = io()

socket.on('countUpdated', (count) => {//the arguments supplyed to this callback are by order. we can call it any name
    console.log('The count has been updated', count);
})

document.querySelector('#increment').addEventListener('click', () => {
    console.log('clicked');
    socket.emit('increment')
})
