

It is a web application for managing campus events and activities, and its features are as follows

Event management
User authentication
Real-time updates
Responsive design

To setup The application provides functions that act as endpoints for generating reports:the project in your local first Clone the repository:

git clone https://github.com/Vishalbharadwaj27/single-campus-hub.git

Navigate to the directory and install dependencies:

cd single-campus-hub && npm install


To Start the development server:
npm run dev

--About the project 

In this project the admins can create events, modify them and can get the list of students who are participating in each of the events.
whereas the students can read indetail about the events that are lined up and can register or also cancel their registration from a particular event.Also the attendance can be taken for a student for the particular event that the student is participating through the portal itself

This is made for the convenience of the college and its students for easier engagement and involvement of students in all the events whithout the struggle for a manual registeration.

--How i built the project

1. I have used an ai platform called as LOVABLE ai to do this application, and gave it super specific prompts and made the functional prototype of what was asked to be delivered
2. I have used a set of mock data for the application, the data structures and types are based on a PostgreSQL schema
3. The project have API design with functions that act as endpoints, in the "CampusEventPlatform.tsx" file there is a mockAPI that cretes events , regestes students for events, marking attendance and generating reports.
4. The application provides functions that act as endpoints for generating reports such as "fetchEventWithStats" for Total registrations per event and also Attendance percentage.
5. I have used the React framework with TypeScript as it is much more easier and the most popular for web development.