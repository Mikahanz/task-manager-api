const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send Welcome Email

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'hanzel.michael@gmail.com',
    subject: 'Welcome To Task Manager App!',
    text: `Welcome to the Task Manager App, ${name}. Le me know how you get along with the app`,
    html: `<strong>Hi ${name}, Welcome To our ecosystem, This is a great app.</strong>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      console.error(error);
    });
};

// Send Cancelation Email

const sendCancelationEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'hanzel.michael@gmail.com',
    subject: `Good Bye, ${name}.`,
    html: `<strong>Good Bye, ${name}, Sorry to see you go!, Hope to see you again soon.</strong>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log('Cancelation Email Sent!');
    })
    .catch((error) => {
      console.log('error sending cancelation email');
    });
};

// Export

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
