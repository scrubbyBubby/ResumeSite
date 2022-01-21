# Personal Resume Site

### Site Link (Currently inaccessible due to hosting domain issue. Will return in 24-48 hours.)
<http://codinglikelyoko.com>

### Overview
A themed site designed around the idea of an alien lifeform analyzing humans. An abridged version of my resume is included within the site, as well as separate pages for each of the projects that I have completed. Animations and design elements of the site are also themed after an alien monitor, with functional controls to change the color of the screen, tab between projects, and scroll the current page.

### Stack
I'm using vanilla React.js with generate-react-cli for easy component creation through the terminal. Styling is pure CSS and html is written in JSX as is standard with React.

### Goals
The focus of the project was to demonstrate the ability to animate elements within React in interesting ways. Different project tabs are animated in and out in a swinging motion, with seamless creation of the new tab and destruction of the old tab. Several SVGs made by myself also rotate in a way that implied a three-dimensionality, but is really just a clever use of rotate(3d) with a transform-origin shifted in the z-axis. Clicking and dragging of pseudo-controls is handled directly through JavaScript, and this was leveraged to create the controls that drag along a curved path, as only arithmetic is used to determine the drag path of the controls along the circular track. In addition, I created a popup which allows users to either enable or leave disabled the subtle flicker effect of the monitor, as this could potentially affect some with light sensitive conditions.
