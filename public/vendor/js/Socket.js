const socket = io();

socket.on('message', (message) => {
 
  $.ajax({
    url: '/admin/uploadMessage',
    method: 'post',
    data: { message },
    success: (response) => {

    },
  });
});

socket.on('notification', (message) => {
  $.notify(`${message}`, {
    className: 'info',
  });
  $.ajax({
    url: '/admin/uploadNotification',
    method: 'post',
    data: { message },
    success: (response) => {

    },
  });
});

function showMessage(Name, subject, Email, message) {
  document.getElementById('Nameclind').innerHTML = Name;
  document.getElementById('clindEmail').innerHTML = `Email:${Email}`;
  document.getElementById('clindSubject').innerHTML = `Subject:${subject}`;
  document.getElementById('clindMessage').innerHTML = `Message:${message}`;
}
