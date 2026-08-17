const dotenv = require('dotenv');

dotenv.config();

function sendAdminNotification(appointment) {
  console.log('[Bot local mock]');
  console.log(JSON.stringify(appointment, null, 2));
}

module.exports = { sendAdminNotification };
