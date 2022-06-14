const chatForm = document.getElementById('chatForm');

const socket = io();

// message submit

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // get message text
  const msg = e.target.elements.msg.value;
  const clindName = e.target.elements.clindName.value;
  const subject = e.target.elements.subject.value;
  const clindEmail = e.target.elements.clindEmail.value;
  const time = moment().format('MMMM Do YYYY, h:mm');
  // emiting message to server
  socket.emit('chatMessages', {
    clindName, msg, subject, clindEmail, time,
  });
  swal({
    title: 'Success!',
    text: 'Message has sent to the admin!',
    icon: 'success',
    button: 'Aww yiss!',
  }).then(() => {
    window.location.reload();
  });
});
