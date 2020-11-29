import React from 'react';
import SimpleLayout from '../components/SimpleLayout';

import accept from '../img/accept.webm';
import adjust from '../img/adjust.webm';
import attendance from '../img/attendance.webm';
import create from '../img/create.webm';
import dayweek from '../img/dayweek.webm';
import group from '../img/group.webm';
import invite from '../img/invite.webm';
import pastfuture from '../img/pastfuture.webm';
import reject from '../img/reject.webm';

function Instructions() {

  return (
    <SimpleLayout>
      <div className="px-3 py-3">
        <h6>Quick links</h6>
        <div style={{float: 'left', width: '40%'}}>
          <ul>
            <li><a href="#one" style={{ color: 'black' }}>Create an appointment</a></li>
            <li><a href="#two" style={{ color: 'black' }}>Create group appointment</a></li>
            <li><a href="#three" style={{ color: 'black' }}>Adjust time for creating appointment</a></li>
            <li><a href="#four" style={{ color: 'black' }}>Accept appointment</a></li>
            <li><a href="#five" style={{ color: 'black' }}>Reject appointment</a></li>
          </ul>
        </div>
        <div style={{float: 'left', width: '40%'}}>
          <ul>
          <li><a href="#six" style={{ color: 'black' }}>Invite students</a></li>
          <li><a href="#seven" style={{ color: 'black' }}>Track attendance</a></li>
          <li><a href="#eight" style={{ color: 'black' }}>Day/week view</a></li>
          <li><a href="#nine" style={{ color: 'black' }}>Past/future</a></li>
          </ul>
        </div>
        <div style={{content: "", display: 'table', clear: 'both'}}/>
        <div>
          <h3 style={{ marginTop: '30px', marginBottom: '20px' }}>
            Innexgo Hours
          </h3>
          <p style={{ marginBottom: '20px' }}>
            Innexgo Hours is a service that helps teachers and administrators give and track
            office hours in a simple application. This guide walks users through the features that
            Hours provides and how to use them. If you're new to using Hours, reading through this
            guide will teach you the basics right away.
          </p>
          <hr id="one" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Create an appointment</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={create} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            Click on the calendar to create an office hour appointment. A popup will allow you to enter details (student, comments)
            and submit. The appointment will show in the student's calendar.
          </p>

          <hr id="two" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Create group appointment</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={group} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            To make an appointment that all students can view, make it visible to all students. It will appear in their calendar as an appointment with you.
            Their attendance will not be mandatory, but canbe tracked if you add individual students to the appointment.
          </p>

          <hr id="three" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Adjust time for creating appointment</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={adjust} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            Drag in the calendar as needed to edit the duration of the appointment you want to create.
          </p>

          <hr id="four" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Accept appointment</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={accept} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            Appointment requests from students will appear in a different color. Click to view a popup that allows you to choose a time slot for
            the appointment - either the highlighted region (which is the time the student requested) or a new one. Drag in the calendar to adjust 
            the duration of the appointment. Hit accept, then submit to accept it.
          </p>

          <hr id="five" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Reject appointment</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={reject} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            Use the red reject button, then submit to reject an appointment request. It will disappear from your calendar
            and show as a rejected appointment in the student's calendar (with comments if you add any).
          </p>

          <hr id="six" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Invite students</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={invite} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            Use the 'Add Students' tab on an appointment to add students to an office hour appointment. The appointment will be added to their calendar.
            It will display with the name of the student it was originally made for. Attendance can be marked for each of these students.
          </p>

          <hr id="seven" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Track attendance</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={attendance} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            Use the dropdown list in the appointment to mark a student as Present (default), Tardy, or Absent.
          </p>

          <hr id="eight" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Day/week view</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={dayweek} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            Use the day/week buttons in the top right corner to toggle between the two view options.
          </p>

          <hr id="nine" style={{ marginTop: '20px', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '20px' }}>Past/future appointments</h5>
          <video width='80%' height='60%' controls style={{ marginBottom: '20px' }}>
            <source src={pastfuture} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <p>
            Use the arrows in the top left to navigate between past and future weeks/days, depending on the selected view. 
            Use the 'today' button to go back to the current day/week. Attendance can only be taken for current and future
            appointments.
          </p>
        </div>
      </div>
    </SimpleLayout>
  );
}

export default Instructions;
