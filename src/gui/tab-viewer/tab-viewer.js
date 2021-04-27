import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Link, BrowserRouter } from 'react-router-dom';
import './tab-viewer.css';

import { MainIcon, ICON } from '../main-icon/main-icon.jsx';

import SlideControl from '../slide-control/slide-control.js';

function createListItems(itemArray) {
    console.log(`Creating list for items ${JSON.stringify(itemArray)}`);
    return itemArray.map(name => {
        return createListItem(name);
    })
}

function createListItem(itemName) {
    return <div className="list-item-wrapper">
        <div>
            { itemName }
        </div>
    </div>
}

function parseItems(tabName, itemObject, iconObject) {
    if (itemObject === undefined) {
        console.log(`There is no itemObject for ${tabName}`);
        return <div></div>;
    }
    console.log(`1) TabName is ${tabName} and itemObject is ${JSON.stringify(itemObject)}`);
    const getItemInfo = function(tabName, itemObject, iconObject) {
        return (tabItem) => {
            let type = (typeof itemObject[tabItem] === 'string') ? 'string' :
                (Array.isArray(itemObject[tabItem])) ? 'array' : 'object';
            type = (tabItem === 'simpleIcon' || tabItem === 'tripleIcon' || tabItem === 'none') ?
                tabItem : type;
            console.log(`Item is type ${type}.`);
            console.log(`tabItem="${tabItem}" itemObject="${itemObject[tabItem]}"`);
            const templates = {
                'simpleIcon': () =>
                    <div className="summary-icon" style={ iconObject.style }>
                        <div className="sub-icon summary-icon-0">{ iconObject.content }</div>
                        <div className="sub-icon summary-icon-1">{ iconObject.content }</div>
                        <div className="sub-icon summary-icon-2">{ iconObject.content }</div>
                        <a href={ iconObject.linkTarget } className="link-text">Visit Site</a>
                    </div>,
                'tripleIcon': () =>
                    <div className="summary-icon" style={ iconObject.style }>
                        <div className="sub-icon-0 summary-icon-0">{ iconObject.content0 }</div>
                        <div className="sub-icon-0 summary-icon-1">{ iconObject.content0 }</div>
                        <div className="sub-icon-0 summary-icon-2">{ iconObject.content0 }</div>
                        <div className="sub-icon-1 summary-icon-0">{ iconObject.content1 }</div>
                        <div className="sub-icon-1 summary-icon-1">{ iconObject.content1 }</div>
                        <div className="sub-icon-1 summary-icon-2">{ iconObject.content1 }</div>
                        <div className="sub-icon-2 summary-icon-0">{ iconObject.content2 }</div>
                        <div className="sub-icon-2 summary-icon-1">{ iconObject.content2 }</div>
                        <div className="sub-icon-2 summary-icon-2">{ iconObject.content2 }</div>
                    </div>,
                'none': () => <div></div>,
                'string': () => <div className={ `${tabItem === 'Summary' ? 'summary-info-text' : 'info-text'}` }>{ itemObject[tabItem] }</div>,
                'array': () => {return createListItems(itemObject[tabItem])},
                'object': () => {return parseItems(tabName, itemObject[tabItem])},
            }
            let template = templates[type]();
            return template;
        }
    }(tabName, itemObject, iconObject);
    console.log(`2) TabName is ${tabName} and itemObject is ${JSON.stringify(itemObject)}`);
    const protocols = {
        'summary': (target, icon) => <div className="summary-text-wrapper">
            <div className="summary-text" style={ {'paddingLeft': '10px'} } key={ `${tabName}-summary` }>
                <div style={ {'transform': 'translate3d(-40px, 0, 0)'} } className="header-text">Summary</div>
                { getItemInfo(target) }
            </div>
            { getItemInfo(icon) }
        </div>,
        'other': (name) => <div className="other-text-wrapper" style={ {'paddingLeft': '40px'} } key={ `${tabName}-${name}` }>
            <div style={ {'transform': 'translate3d(-40px, 0, 0)'} } className="header-text">{name}</div>
            { getItemInfo(name) }
        </div>,
    }
    console.log(`3) TabName is ${tabName} and itemObject is ${JSON.stringify(itemObject)}`);
    const newTemplate = Object.keys(itemObject).map(name => {
        const protocol = (name === 'Summary' || name === '***Error Report***') ? 'summary' : 'other';
        const iconType = (iconObject === undefined) ? 'none' :
            (iconObject.content1 !== undefined ? 'tripleIcon' : 'simpleIcon');
        return protocols[protocol](name, iconType);
    })

    return newTemplate;
}

const resumeItems = {
    'Summary': 'Individual is a self-taught programmer with a BS degree in Physics and a BA degree in Philosophy, both from Miami University in Oxford, Ohio. Currently pivoting from past positions in laboratory work and restaurant management towards a future in professional Web Design. Analysis indicates high potential for this individual.',
    'Known Skills': {
        'Languages': 'HTML5, CSS3, SASS/SCSS, JavaScript, TypeScript',
        'Frameworks': 'Angular JS, Angular 2, React',
        'Other Programs': 'Angular CLI, Google Sheets, Google Apps Script, Inkscape (Vector Graphics Editor)',
    },
    'Key Strengths': [
        'Able to learn new skills and rapidly apply them',
        'Self-taught and self-driven',
        'Holds a strong grasp of advanced mathematics and physics',
        'Effective communicator with strong analytical thinking and formal reasoning skills',
        'Adaptable, Reliable, Passionate',
    ],
    'Educational History': {
        'Bachelors of Science in Physics from Miami University in Oxford, Ohio': [
            'Strong background in mathematics and analytical thinking. Strong problem solving skills.'
        ],
        'Bachelors of Arts in Philosophy from Miami University in Oxford, Ohio': [
            'Strong ability to verbalize ideas effectively and convincingly.',
            'Ability to break down complex ideas and problems into manageable pieces.',
        ],
        'High School Diploma from Marion L Steele in Amherst, Ohio': [
            'Mitochondria are the powerhouse of the cell.',
        ]
    },
    'Professional History': {
        'Laboratory Work for Miami University in Oxford, Ohio': [
            'Independent work environment with emphasis on attention to detail during chemical fabrication procedures.',
            'Data heavy work environment that required more advanced google spreadsheet functions to perform velocity and acceleration analysis of video footage manually',
            'After 3 years of laboratory work I was first author of a paper on ferrofluid motion published in Langmuir [link].',
        ],
        'Restaurant management for Kona Bistro and MIA in Oxford, Ohio': [
            'Strong team management skills and persistent work ethic',
            'Experience with many managerial responsibilities such as creating employee training packets, training new employees, assuring inventory accuracy, and ordering required supplies.',
        ]
    },
    'Potential Weaknesses': [
        'Vulnerable to most toxins',
        'Less than 6 feet tall',
        'Empathetic',
    ]
}

const project1Items = {
    'Summary': 'An aesthetically pleasing site with efficient component usage and a sleek mobile view. Features an interactable component to choose between several ice-cream-colored themes.',
    'Features': [
        'Written entirely in AngularJS to leverage Angular’s component functionality to keep code dry',
        'Custom built image display that cycles through images automatically or can be interacted with to move to certain images',
        'Mobile view with full site functionality and dynamic styling to accommodate smaller screens',
        'Theme selector that uses JavaScript to dynamically assign values to css variables which control the theming',
        'Theme choice is remembered upon subsequent visits by utilizing local storage',
    ]
};

const project2Items = {
    'Summary': 'A site that leverages the component functionality of Angular 2 to create a collection point for links, checklists, and notes . Allows the user to create Pads and populate them with Elements, which can be any of the 3 types described. Both the Pads and Elements can be customized by the user in a variety of ways that correspond to typical CSS stylings. Strong focus on mobile view functionality and intuitive customization interfaces that include live preview capabilities.',
    'Features': [
        'Customization is handled with a set of several customization forms. Options on these forms use text boxes, custom drop down lists, or color entry (which can be done through a direct hexadecimal value or a color picker).',
        'Able to customize Elements individually or create Templates to apply the same styling to multiple Elements and keep their customization in sync. Additionally, collections of  Templates can come together to create Themes that allow for automatically setting an Element’s Template based upon its type.',
        'Customization and element data are stored in localStorage when changes are made. Upon loading, a check for this data determines whether to initiate a new CrashPad with a tutorial checklist, or to instead load an already existing CrashPad.',
        'Links, notes, and checklists are separated into Pads, which can easily be searched, rearranged, or styled through the PadNavigator. This allows for substantial scalability, even for CrashPads which have dozens of Pads and hundreds of links.',
        'Adaptive mobile display which changes the styling for customization forms, menu buttons/interfaces, Element previewing, and more.',
    ]
};

const project3Items = {
    '***Error Report***': `A React site built around the idea of an AI database for a distant planet that catalogues all observable life. Shows creativity and a willingness to take risks, while conveying relevant information about my qualifications and abilities as a web designer. Utilizes a basic form of material design to give the visual impression of a computer screen that is being manipulated by the mouse. Virtual controls utilize drag and drop controls along with JavaScript and CSS animations to control the page being viewed, the scroll state, as well as the current chosen theme for the site.`,
    'Features': [
        'Focus on interesting UI and a novel form of presenting information that would typically be in a résumé',
        'A theme choice is included to allow the user to personalize the site in some minor way, as well as giving more opportunity to experiment with drag and drop controls.',
        'Theme choice also allows for the demonstration of dragging on a partial circle to choose the theme color and then dark/light mode',
        'Focus on javascript animation techniques and dynamic, draggable elements of the screen',
        'Demonstrates flexibility in frameworks, as previous projects were written in Angular/TypeScript while this project is written in React/Javascript.',
        'Initial analysis indicates this will increase the likelihood of employment by 45%.',
    ]
};

const IconSVG = <svg
   width="800"
   height="800"
   viewBox="0 0 132.29166 132.29167"
   version="1.1"
   id="svg8">
  <defs
     id="defs2" />
  <g
     id="layer1"
     transform="translate(0,-164.70832)">
    <path className="main-icon-svg"
        style={{
            display: "inline",
            fillOpacity: 1,
            stroke: "none",
            strokeWidth: 2.64583325,
            strokeLinecap: "round",
            strokeLinejoin: "miter",
            strokeMiterlimit: 4,
            strokeDasharray: "none",
            strokeDashoffset:0,
            strokeOpacity:1,
            paintOrder: "markers fill stroke"
        }}
       d="M 248.03125,21.703125 141.64648,128.08789 80.402344,66.550781 100.49023,46.507812 69.998047,43.035156 39.505859,39.560547 l 3.375,30.533203 3.373047,30.5332 19.992188,-19.949216 61.261716,61.548826 -107.419919,107.41992 7.068359,7.06641 98.70703,98.70703 -60.333983,60.04688 -20.042969,-20.08789 -3.472656,30.49218 -3.47461,30.49024 30.533204,-3.37305 30.533203,-3.37305 -19.949219,-19.99414 60.3457,-60.0625 108.0293,108.0293 104.11914,-104.11914 60.86523,61.15625 -20.08789,20.04297 30.49219,3.47461 30.49219,3.47461 -3.375,-30.53516 -3.37109,-30.5332 L 427.17188,420.5 366.29102,359.32812 475.97266,249.64648 369.81641,143.49023 l 61.64453,-61.351558 20.04297,20.087888 3.47265,-30.492185 3.47461,-30.492187 -30.5332,3.375 -30.5332,3.371093 19.94921,19.994141 -61.65625,61.369138 z m 9.7207,38.001953 180.17969,180.179692 -126.05273,-0.19336 0.0312,-28.37696 -24.01758,19.10547 -24.01563,19.10352 23.97657,19.20312 23.9746,19.20703 0.0313,-28.24414 125.5996,0.19141 -179.90625,179.90625 0.17969,-117.37891 28.37696,0.0312 -19.10547,-24.01757 -19.10352,-24.01758 -19.20508,23.97656 -19.20508,23.97461 28.24415,0.0312 -0.17774,116.44726 -179.115234,-179.11523 125.580074,0.19336 -0.0312,28.37695 24.01758,-19.10547 24.01758,-19.10351 -23.97656,-19.20508 -23.97461,-19.20508 -0.0312,28.24414 -125.750001,-0.1914 179.462891,-179.462894 0.19141,125.597654 -28.24415,0.0293 19.20508,23.97461 19.20508,23.97656 19.10352,-24.01367 19.10547,-24.01758 -28.37696,0.0293 z"
       transform="matrix(0.26458333,0,0,0.26458333,0.52151783,164.80166)"
       id="path4527" />
  </g>
</svg>

const OldIconSVG = <svg
    width="800"
    height="800"
    viewBox="0 0 132.29166 132.29167"
    version="1.1"
    id="svg8">
    <defs
    id="defs2" />
    <g
        id="layer1"
        transform="translate(0,-164.70832)">
        <g
            id="g4516">
            <path className="main-icon-svg"
                id="path4531"
                style={{
                    display: "inline",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 2.64583325,
                    strokeLinecap: "round",
                    strokeLinejoin: "miter",
                    strokeMiterlimit: 4,
                    strokeDasharray: "none",
                    strokeDashoffset:0,
                    strokeOpacity:1,
                    paintOrder: "markers fill stroke"
                }}
                d="m 70.514227,230.66216 6.343798,5.08134 6.343282,5.08135 0.0083,-7.47293 35.981783,0.0548 0.008,-5.29064 -35.984365,-0.0553 0.0083,-7.50807 -6.354651,5.05499 z m -4.985602,-4.38619 5.08134,-6.3438 5.08135,-6.34328 -7.47293,-0.008 0.0548,-35.98179 -5.29064,-0.008 -0.0553,35.98436 -7.50807,-0.008 5.05499,6.35465 z m -4.159594,4.47772 -6.3438,-5.08134 -6.34328,-5.08135 -0.008,7.47293 -35.98178,-0.0548 -0.008,5.29064 35.98436,0.0553 -0.008,7.50807 6.35465,-5.05499 z m 4.33946,4.33703 -5.081344,6.3438 -5.081344,6.34328 7.472928,0.008 -0.05478,35.98178 5.290635,0.008 0.05529,-35.98436 7.508068,0.008 -5.054986,-6.35465 z m 55.590169,-59.47028 -8.0788,0.89269 -8.07843,0.89233 5.27832,5.28999 -16.501437,16.42398 3.73521,3.74688 16.503627,-16.42544 5.30317,5.31485 0.919,-8.06784 z m -110.913081,109.83368 8.0788,-0.89269 8.07843,-0.89233 -5.27832,-5.28999 16.50144,-16.42398 -3.73521,-3.74688 -16.50363,16.42544 -5.30317,-5.31485 -0.919,8.06784 z m 110.845841,0.25622 -0.89269,-8.0788 -0.89233,-8.07843 -5.28999,5.27832 -16.423973,-16.50144 -3.74688,3.73521 16.425433,16.50363 -5.31485,5.30317 8.06784,0.919 z M 11.019786,175.7422 l 0.89269,8.0788 0.892325,8.07843 5.289996,-5.27832 16.423973,16.50144 3.746881,-3.73521 -16.425435,-16.50363 5.314843,-5.30317 -8.067832,-0.919 z m -5.7054331,55.01768 1.871344,1.87134 58.4398931,58.4399 60.30985,-60.30986 -60.311233,-60.31124 z m 7.4840041,10e-4 52.827232,-52.82723 52.825851,52.82585 -52.827236,52.82723 z m -1.640154,-18.2433 c -0.931355,-0.1007 -1.874614,-0.0832 -2.8124999,0.0684 -3.7519334,0.60604 -6.716797,3.56624 -7.3300781,7.3164 -0.61345209,3.75012 0.8930543,7.58838 3.7148438,10.41016 l 1.8710937,1.87109 3.7421875,-3.74218 -1.8710938,-1.86914 c -1.7537305,-1.75373 -2.5148629,-4.10175 -2.234375,-5.81641 0.2804192,-1.71474 1.2340454,-2.66795 2.9511719,-2.94531 h 0.00195 c 1.7169549,-0.27749 4.0632009,0.48797 5.8144529,2.24414 l 1.869141,1.875 3.746094,-3.73633 -1.867188,-1.875 c -2.113355,-2.11929 -4.801637,-3.49868 -7.595703,-3.80078 z m 63.447266,-47.21875 c -2.794224,0.29729 -5.483278,1.67467 -7.59961,3.79101 l -1.871093,1.8711 3.742187,3.74218 1.871094,-1.87109 c 1.753724,-1.75373 4.099791,-2.51486 5.814453,-2.23437 1.714739,0.28042 2.66795,1.23404 2.945312,2.95117 0.277489,1.71695 -0.487974,4.06515 -2.24414,5.8164 l -1.873047,1.86719 3.736328,3.74805 L 81,183.11133 c 2.825714,-2.81781 4.338733,-6.65471 3.732422,-10.40625 -0.606038,-3.75194 -3.564292,-6.7168 -7.314453,-7.33008 -0.93753,-0.15336 -1.881092,-0.17527 -2.8125,-0.0762 z m 50.769531,65.1582 -3.74219,3.74219 1.8711,1.87109 c 1.75373,1.75373 2.51486,4.09979 2.23437,5.81446 -0.28042,1.71473 -1.23404,2.66795 -2.95117,2.94531 h -0.002 c -1.71696,0.27749 -4.0632,-0.48798 -5.81446,-2.24414 l -1.86914,-1.87305 -3.74609,3.73633 1.86719,1.87305 c 2.8178,2.82571 6.65666,4.33873 10.4082,3.73242 3.75193,-0.60604 6.7168,-3.56625 7.33008,-7.31641 0.61345,-3.75012 -0.89306,-7.58838 -3.71485,-10.41016 z m -74.023438,46.23242 -1.875,1.86719 c -2.825713,2.81781 -4.33678,6.65666 -3.730468,10.4082 0.606721,3.75105 3.564917,6.7169 7.314453,7.33008 3.750117,0.61345 7.588382,-0.89306 10.410156,-3.71484 l 1.871094,-1.8711 -3.740235,-3.74218 -1.871093,1.87109 c -1.753726,1.75373 -4.101744,2.51486 -5.816407,2.23438 -1.714738,-0.28042 -2.66795,-1.236 -2.945312,-2.95313 -0.277488,-1.71696 0.487975,-4.0632 2.244141,-5.81445 l 1.875,-1.86914 z M 6.7246094,229.33594 4.8515625,231.20508 c -2.8257139,2.81781 -4.33873338,6.6547 -3.7324219,10.40625 0.606038,3.75193 3.564292,6.7168 7.3144532,7.33008 3.7501172,0.61345 7.5903352,-0.89306 10.4121092,-3.71485 l 1.871094,-1.87109 -3.742188,-3.74219 -1.871093,1.8711 c -1.753726,1.75373 -4.101744,2.51486 -5.8164066,2.23437 -1.7147389,-0.28042 -2.6679505,-1.23405 -2.9453125,-2.95117 -0.2774885,-1.71696 0.4899276,-4.06516 2.2460937,-5.81641 l 1.8730474,-1.86719 z M 56.962891,165.57422 c -0.931356,-0.1007 -1.874614,-0.0813 -2.8125,0.0703 -3.751934,0.60604 -6.718751,3.56429 -7.332032,7.31445 -0.613452,3.75012 0.895011,7.59034 3.716797,10.41211 l 1.869141,1.8711 3.742187,-3.74219 -1.871093,-1.87109 c -1.753734,-1.75373 -2.514863,-4.10175 -2.234375,-5.81641 0.280419,-1.71474 1.235998,-2.66795 2.953125,-2.94531 1.716956,-0.27749 4.0632,0.48993 5.814453,2.24609 l 1.86914,1.87305 3.746094,-3.73633 -1.867187,-1.87305 c -2.113356,-2.11928 -4.799684,-3.50063 -7.59375,-3.80273 z m 64.189449,45.76367 c -2.79422,0.2973 -5.48327,1.67468 -7.59961,3.79102 L 111.68164,217 l 3.74219,3.74219 1.87109,-1.8711 c 1.75373,-1.75373 4.09979,-2.51486 5.81446,-2.23437 1.71473,0.28042 2.66795,1.23404 2.94531,2.95117 0.27749,1.71696 -0.48798,4.06515 -2.24414,5.81641 l -1.87305,1.86718 3.73633,3.74805 1.87305,-1.86914 c 2.82571,-2.81781 4.33873,-6.65471 3.73242,-10.40625 -0.60594,-3.75131 -3.56518,-6.71612 -7.31446,-7.33008 h -0.002 c -0.93689,-0.15307 -1.87978,-0.1752 -2.81055,-0.0762 z m -41.849606,65.40234 -3.740234,3.74024 1.871094,1.87109 c 1.75373,1.75373 2.514862,4.10175 2.234375,5.81641 -0.280419,1.71473 -1.236006,2.66795 -2.953125,2.94531 -1.716964,0.27749 -4.065149,-0.48797 -5.816406,-2.24414 l -1.867188,-1.875 -3.748047,3.73633 1.869141,1.875 c 2.817808,2.82571 6.654704,4.33678 10.40625,3.73047 v 0.002 c 3.751928,-0.60604 6.718748,-3.56624 7.332031,-7.31641 0.613453,-3.75012 -0.895021,-7.58838 -3.716797,-10.41015 z"
            />
        </g>
    </g>
</svg>

const screenTextOptions = [
    'Creating matrix queries . . .',
    'Scouring second thoughts . . .',
    'Cross-referencing neural patterns . . .',
    'Establishing analytical dominance . . .',
    'Denoising cognitive dissonance latices . . .',
]

let screenText = 'Accumulating data from the Aether Collective . . .';

let strobeWarningTemplate = <div id={ `strobe-warning`} className="strobe-warning">
    <div className="warning-box">
        <div className="warning-box-text">
            This webpage utilizes flashing lights for some affects. These lights could potentially trigger individuals with photosensitive disorders. Would you like to turn on these animations?
        </div>
        <div className="warning-box-choices">
            <div className="no-choice">Keep Off</div>
            <div className="yes-choice">Turn On</div>
        </div>
    </div>
</div>

let bootTemplateFunc = function(sText, viewerId) {
    return <div id={ `${viewerId}-boot-screen` } className="boot-screen">
        <div className="main-icon-master-wrapper">
            <div className="main-icon-wrapper main-icon-wrapper-0">
                { IconSVG }
            </div>
            <div className="main-icon-wrapper main-icon-wrapper-1">
                { IconSVG }
            </div>
            <div className="main-icon-wrapper main-icon-wrapper-2">
                { IconSVG }
            </div>
            <div className="main-icon-wrapper main-icon-wrapper-3">
                { IconSVG }
            </div>
        </div>
        <div className="boot-screen-text">
            { sText }
        </div>
        <div className="boot-screen-load-bar"></div>
    </div>
}

let bootTemplate = bootTemplateFunc(screenText);

function toggleAnimations() {
    console.log(`Toggling animations...`);

    const flickerAnimationValue = document.documentElement.style.getPropertyValue('--flicker-animation');
    const animationsOn = (flickerAnimationValue === 'paused') ? false : true;
    
    const protocols = {
        'turnOn': () => {
            console.log(`Turning on...`);
            promptChoice(false, false);
        },
        'turnOff': () => {
            console.log(`Turning off...`);
            document.documentElement.style.setProperty('--flicker-animation', 'paused');
            document.getElementById('animation-radio').className = 'off';
        },
    };
    const protocol = (animationsOn) ? 'turnOff' : 'turnOn';
    console.log(`Protocol is ${protocol}`);
    protocols[protocol]();
}

function openMissionStatement() {
    const missionStatementBox = document.getElementById(`mission-statement-box`);
    const missionStatement = document.getElementById('mission-statement');

    missionStatement.style.display = 'block';
    setTimeout(() => {
        missionStatementBox.style.transition = ''
        missionStatement.style.opacity = '1';
        setTimeout(() => {
            missionStatementBox.style.transform = 'translate3d(0px, calc(100% * -1), 0px)';
            setTimeout(() => {
                missionStatementBox.style.transition = 'transform 800ms ease-in-out, opacity 500ms ease-in-out';
            }, 20);
        }, 20);
        setTimeout(() => {
            missionStatementBox.style.transform = 'translate3d(0px, 0px, 0px)';
        }, 500);
    }, 20);
}

const mainMenuLinks = {
    resume: 'https://docs.google.com/document/d/1Zzsjvglv6lwffo0FGbahQ53Ai3C74P4roSWVUrDwyS4/edit',
    linkedIn: 'https://www.linkedin.com/in/tyler-ody-763997136/',
    bugReport: 'https://docs.google.com/forms/d/e/1FAIpQLSc97fmXaiccQlYeH9Pn3Iz8s7OvG0FYKuGO7TB7rfBmz4O-jw/viewform?usp=sf_link',
}

function getMainMenuTemplate() {
    const animationState = (document.documentElement.style.getPropertyValue(`--flicker-animation`) === 'running') ? 'on' : 'off';
    return <div className="main-menu-wrapper">
                <div className="main-menu">
                    <div className="main-menu-header">
                        Control Board
                    </div>
                    <div className="main-menu-list">
                        <div className='flex-row'>
                            <div>Flashing Animations</div>
                            <div onClick={ toggleAnimations } 
                                className="radio-confirm">
                                <span className={ animationState } id='animation-radio'>&#10003;</span>
                                <span className="radio-border" id='animation-radio-border'></span>
                            </div>
                        </div>
                        <div className="hover-shake" onClick={ openMissionStatement }>Mission Statement</div>
                        <a className="hover-shake" href={ mainMenuLinks.resume }>Standard Résumé</a>
                        <a className="hover-shake" href={ mainMenuLinks.linkedIn }>LinkedIn</a>
                        <a className="hover-shake" href={ mainMenuLinks.bugReport }>Bug Report</a>
                    </div>
                </div>
            </div>
}

//const mainMenuTemplate = getMainMenuTemplate();

const resumeTemplate = function(items) {
    return <div className="resume-list">
        <div className="main-header">
            Individual Analysis: Tyler Ody
        </div>
        { parseItems('resume', items, {
            content0: <svg
                width="200"
                height="177"
                viewBox="0 0 41.274999 36.512501"
                version="1.1"
                id="svg8">
                <g transform="translate(0,-260.48748)"
                    style={{display: 'inline'}}>
                    <g transform="translate(-0.42039328,1.3975899)">
                    <path className="icon-path"
                        transform="matrix(0.26458333,0,0,0.26458333,0,260.48748)"
                        d="m 79.699219,-5.3671875 -64.1875,34.3730465 -0.113281,69.060547 17.324218,9.392574 5.376953,2.91016 4.736329,-10.705078 -3.876954,-2.228515 -11.121093,-6.025391 0.08984,-55.683594 51.753907,-27.710937 51.664062,27.966797 -0.0898,55.683594 -51.679691,27.671874 -8.507813,-4.83398 -5.550781,-3.15039 -14.248047,5.67578 13.339844,7.36328 14.792969,8.41015 64.269539,-34.410152 0.10742,-69.066406 z M 54.25,35.955525 v 57.556641 c 0,3.207898 -1.836985,7.018534 -6.284123,7.563084 -1.20734,0.14784 -3.577351,-0.3955 -5.129939,-1.411188 l -4.736329,10.705078 c 3.520028,1.66965 6.442233,1.89652 9.445313,1.89652 6.723681,0 11.414636,-2.83525 14.949219,-7.42386 3.561156,-4.58862 4.591797,-10.858706 4.591797,-19.496097 V 35.955525 Z"
                        style={{
                            fontSize: 'medium',
                            fontFamily: 'sans-serif',
                        }}/>
                    <g
                        style={{
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                            fontSize: '40px',
                            lineHeight: 1.25,
                            fontFamily: 'sans-serif',
                            textAlign: 'center',
                            letterSpaing: '0px',
                            wordSpacing: '0px',
                            textAnchor: 'middle',
                            fillOpacity: 1,
                            stroke: 'none',
                            strokeWidth: 0.4612118,
                        }}
                        transform="matrix(0.54002066,0,0,0.60941588,109.10107,257.01276)" />
                        <path className="icon-path"
                            id="path5167"
                            d="m 25.892578,269.92578 c -1.637191,0.0111 -3.255927,0.37068 -4.611328,1.14453 -1.355401,0.77385 -2.544327,2.16082 -2.539062,3.92578 0.0026,0.85923 0.432561,1.67024 0.960937,2.18555 0.528376,0.51531 1.131561,0.83177 1.765625,1.09375 1.268128,0.52395 3.048511,0.67582 4.456311,0.95734 1.4078,0.28151 2.543664,0.29668 3.266554,0.85461 0.644806,0.49766 0.207568,1.33364 -0.08804,1.51309 -0.650164,0.39469 -2.071403,0.55014 -3.244202,0.59684 -1.172799,0.0467 -2.312947,-0.195 -3.001953,-0.59961 -0.689006,-0.40462 -0.982445,-0.77105 -0.984375,-1.65625 l -3.173828,0.006 c 0.0042,1.94028 1.123985,3.54998 2.548828,4.38671 1.424843,0.83674 3.100373,1.10037 4.738281,1.03516 1.637908,-0.0652 3.251691,-0.46352 4.597656,-1.25586 1.345966,-0.79234 2.53307,-2.17281 2.509766,-3.9375 -0.01169,-0.88509 -0.550312,-1.65814 -1.09375,-2.08594 -0.543438,-0.42779 -1.123501,-0.66842 -1.740234,-0.8789 -1.233467,-0.42097 -2.657995,-0.67501 -4.039063,-0.95117 -1.381068,-0.27617 -2.819207,-0.39354 -3.539062,-0.91797 -0.736897,-0.53685 -0.337559,-1.21906 0.173828,-1.51368 0.733895,-0.42281 1.906335,-0.71878 3.058593,-0.72656 1.152259,-0.008 2.267421,0.27606 2.955079,0.72461 0.687657,0.44855 1.017042,0.89859 1.013671,1.87305 l 3.175782,0.0117 c 0.0068,-1.97619 -1.053669,-3.63081 -2.455078,-4.54492 -1.401409,-0.91412 -3.073747,-1.25128 -4.710938,-1.24024 z"
                            style={{
                                fontSize: 'medium',
                                fontFamily: 'sans-serif',
                        }} />
                    </g>
                </g>
            </svg>,
            content1: <svg
                    width="200"
                    height="177"
                    viewBox="0 0 41.274999 36.512501"
                    version="1.1"
                    id="svg8">
                <g transform="translate(0,-260.48748)">
                    <path className="icon-path"
                        style={{
                            fill: 'none',
                            strokeWidth: 3.17499995,
                            strokeLinecap: 'butt',
                            strokeLinejoin: 'miter',
                            strokeMiterlimit: 4,
                        }}
                        d="m 20.641398,262.14808 -16.057295,2.0956 v 23.79126 l 16.05607,7.1748 16.049481,-6.89407 -0.02812,-23.67517 z" />
                    <g
                        transform="matrix(2.5670406,0,0,2.1778194,-32.08462,-330.76577)"
                        style={{
                            fontSize: '12.42714405px',
                            lineHeight: 1.25,
                            fontFamily: 'sans-serif',
                            textAlign: 'center',
                            textAnchor: 'middle',
                        }}>
                    <path className="icon-path"
                        d="m 24.627886,283.50995 h -1.59053 l -0.885919,-2.04741 h -3.303692 l -0.88592,2.04741 h -1.513524 l 4.05714,-9.59634 z m -2.994107,-3.57868 -1.126025,-2.8801 -1.099441,2.89701 z"
                        style={{
                            strokeWidth: 0.11190131,
                        }} />
                    </g>
                </g>
            </svg>,
            content2: <svg
                width="200"
                height="177"
                viewBox="0 0 41.274999 36.512501"
                version="1.1"
                id="svg8">
                <g transform="translate(0,-260.48748)">
                    <g transform="translate(-7.6293946e-7,-0.26460386)">
                    <ellipse className="icon-path"
                        ry="6.1739264"
                        rx="19.404604"
                        cy="279.00833"
                        cx="20.637501"
                        id="path4552"
                        style={{
                            fill: 'none',
                            strokeWidth: 2.11666656,
                            strokeLinecap: 'square',
                            strokeLinejoin: 'miter',
                            strokeMiterlimit: 4,
                            paintOrder: 'markers fill stroke',
                        }} />
                    <ellipse className="icon-path"
                        ry="3.4845264"
                        rx="3.3442097"
                        cy="279.00833"
                        cx="20.637501"
                        id="path4560"
                        style={{
                            paintOrder: 'markers fill stroke',
                        }} />
                    <ellipse className="icon-path"
                        transform="rotate(-60)"
                        style={{
                            fill: 'none',
                            strokeWidth: 2.11666656,
                            strokeLinecap: 'square',
                            strokeLinejoin: 'miter',
                            strokeMiterlimit: 4,
                            paintOrder: 'markers fill stroke',
                        }}
                        id="ellipse4566"
                        cx="-231.30956"
                        cy="157.37677"
                        rx="19.404604"
                        ry="6.1739264" />
                    <ellipse className="icon-path"
                        transform="rotate(60)"
                        style={{
                            fill: 'none',
                            strokeWidth: 2.11666656,
                            strokeLinecap: 'square',
                            strokeLinejoin: 'miter',
                            strokeMiterlimit: 4,
                            paintOrder: 'markers fill stroke',
                        }}
                        id="ellipse4568"
                        cx="251.94705"
                        cy="121.63157"
                        rx="19.404604"
                        ry="6.1739264" />
                    </g>
                </g>
            </svg>,
            style: {
                width: '200px',
                height: '190px',
            },
        }) 
        }
    </div>
}(resumeItems);

const project1Template = <div className="project-one-list">
    <div className="main-header">
        Project 1: Ice Cream Site
    </div>
    { parseItems('project1', project1Items, {
        content: <svg
            width="156"
            height="200"
            viewBox="0 0 55.562499 75.437502"
            version="1.1"
            id="svg8">
            <g id="layer1" transform="translate(0,-219)">
            <path className="icon-path"
                style={ {
                    opacity: 1,
                    fill: 'none',
                    fillOpacity: 1,
                    strokeWidth: 1.32291663,
                    strokeLinecap: 'square',
                    strokeLinejoin: 'miter',
                    strokeMiterlimit: 4,
                    strokeDasharray: 'none',
                    strokeDashoffset: 0,
                    strokeOpacity: 1,
                    paintOrder: 'markers fill stroke',
                } }
                d="m 18.15049,230.74991 c 5.256824,-3.9082 13.064645,-3.75839 18.495028,-0.0348 5.43037,3.72353 7.217095,10.21053 4.318097,15.67753 3.042116,1.57308 4.778166,3.23508 4.941128,5.83295 0.09589,2.60407 -1.600574,5.00661 -4.310795,6.10484 -4.492358,1.88747 -8.230327,-0.97193 -8.230327,-0.97193 -1.407773,1.49009 -3.502303,2.35785 -5.7167,2.36835 -2.21438,0.0112 -4.319638,-0.8373 -5.745948,-2.31396 0,0 -4.579343,2.8193 -7.932419,1.53985 -2.710225,-1.09822 -4.4067231,-3.50074 -4.3107941,-6.1048 0.095934,-2.60409 1.0273321,-3.89768 4.7512351,-5.85114 -3.386005,-6.87718 -1.379485,-12.43961 3.741495,-16.24684 z M 41.32983,258.75985 27.536503,293.55976 14.09097,259.27555"
            />
          </g>
        </svg>,
        style: {
            width: '156px',
            height: '260px',
        },
        linkTarget: 'https://codinglikelyoko.com/#!/not-a-real-site',
        }) }
</div>

const project2Template = <div className="project-one-list">
    <div className="main-header">
        Project 2: CrashPad
    </div>
    { parseItems('project2', project2Items, {
        content: <svg
        width="156"
        height="200"
        viewBox="0 0 79.374998 105.83334"
        version="1.1"
        id="svg5122">
       <g id="layer1" transform="translate(0,-191.16665)">
         <path className="icon-path"
            id="path5729"
            style={ {
                opacity: 1,
                fill: 'none',
                fillOpacity: 1,
                strokeWidth: 1.32291663,
                strokeLinecap: 'square',
                strokeLinejoin: 'miter',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
                strokeDashoffset: 0,
                strokeOpacity: 1,
                paintOrder: 'markers fill stroke',
            } }
            d="m 23.696253,274.86094 31.82372,-0.22401 m -29.819372,-35.41796 28.106735,-0.26188 1.76245,13.02704 -31.809823,0.0759 z M 7.7359091,231.73989 23.759963,252.06002 c 0,0 -0.315252,19.65995 -0.06371,22.80092 3.659228,11.82723 13.785887,15.38765 15.927352,15.27485 1.98757,-0.1047 12.048846,-3.1346 15.896365,-15.49886 0.172563,-2.34165 0.04981,-22.6528 0.04981,-22.6528 l 16.068955,-20.74622 -17.831405,7.71918 -3.924343,-28.17976 -5.024167,11.77494 -5.028493,-20.43916 -5.603815,20.24353 -4.743477,-11.22013 -3.782434,28.08246 z"/>
       </g>
     </svg>,
        style: {
            width: '156px',
            height: '260px',
        },
        linkTarget: 'http://crashpad.link/#/',
        }) }
</div>

const project3Template = <div className="project-one-list">
    <div className="main-header">
        [Self-Reference Error]
    </div>
    { parseItems('????', project3Items, {
        content: <svg
            width="156"
            height="156"
            viewBox="0 0 132.29166 132.29167"
            version="1.1"
            id="svg8">
            <g transform="translate(0,-164.70832)">
                <path className="icon-path"
                    style={ {
                        strokeWidth: 10,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4,
                        strokeDasharray: 'none',
                        strokeDashoffset: 0,
                        paintOrder: 'markers fill stroke',
                    } }
                    d="M 248.03125,21.703125 141.64648,128.08789 80.402344,66.550781 100.49023,46.507812 69.998047,43.035156 39.505859,39.560547 l 3.375,30.533203 3.373047,30.5332 19.992188,-19.949216 61.261716,61.548826 -107.419919,107.41992 7.068359,7.06641 98.70703,98.70703 -60.333983,60.04688 -20.042969,-20.08789 -3.472656,30.49218 -3.47461,30.49024 30.533204,-3.37305 30.533203,-3.37305 -19.949219,-19.99414 60.3457,-60.0625 108.0293,108.0293 104.11914,-104.11914 60.86523,61.15625 -20.08789,20.04297 30.49219,3.47461 30.49219,3.47461 -3.375,-30.53516 -3.37109,-30.5332 L 427.17188,420.5 366.29102,359.32812 475.97266,249.64648 369.81641,143.49023 l 61.64453,-61.351558 20.04297,20.087888 3.47265,-30.492185 3.47461,-30.492187 -30.5332,3.375 -30.5332,3.371093 19.94921,19.994141 -61.65625,61.369138 z m 9.7207,38.001953 180.17969,180.179692 -126.05273,-0.19336 0.0312,-28.37696 -24.01758,19.10547 -24.01563,19.10352 23.97657,19.20312 23.9746,19.20703 0.0313,-28.24414 125.5996,0.19141 -179.90625,179.90625 0.17969,-117.37891 28.37696,0.0312 -19.10547,-24.01757 -19.10352,-24.01758 -19.20508,23.97656 -19.20508,23.97461 28.24415,0.0312 -0.17774,116.44726 -179.115234,-179.11523 125.580074,0.19336 -0.0312,28.37695 24.01758,-19.10547 24.01758,-19.10351 -23.97656,-19.20508 -23.97461,-19.20508 -0.0312,28.24414 -125.750001,-0.1914 179.462891,-179.462894 0.19141,125.597654 -28.24415,0.0293 19.20508,23.97461 19.20508,23.97656 19.10352,-24.01367 19.10547,-24.01758 -28.37696,0.0293 z"
                    transform="matrix(0.26458333,0,0,0.26458333,0.52151783,164.80166)"/>
            </g>
        </svg>,
        style: {
            width: '156px',
            height: '216px',
        },
        linkTarget: 'http://localhost:3000/r%C3%A9sum%C3%A9',
     }) }
</div>

const templates = {
    'boot': () => bootTemplate,
    'Main Menu': () => getMainMenuTemplate(),
    'Résumé': () => resumeTemplate,
    'Project 1': () => project1Template,
    'Project 2': () => project2Template,
    '?????': () => project3Template,
}

function promptChoice(alreadyShowing, useSaved, callback) {
    alreadyShowing = (alreadyShowing === undefined) ? false : alreadyShowing;
    useSaved = (useSaved === undefined) ? true : useSaved;
    callback = (callback === undefined) ? () => {} : callback;

    const noChoiceElement = document.getElementById('strobe-choice-no');
    const yesChoiceElement = document.getElementById('strobe-choice-yes');
    const radioElement = document.getElementById('animation-radio');
    const strobeWarningElement = document.getElementById('strobe-warning');
    const strobeWarningSlideHandle = document.getElementById('strobe-warning-slide-handle');

    const transitionDuration = 300;
    const savedChoice = window.localStorage.getItem('strobeAnimationChoice');
    //const self = this;

    const makeChoice = function(choice, noListener) {
        noListener = (noListener === undefined) ? false : noListener;
        return () => {
            if (!noListener) {
                noChoiceElement.removeEventListener('click', makeChoiceNo);
                yesChoiceElement.removeEventListener('click', makeChoiceYes);
            }
            if (radioElement !== null && radioElement !== undefined) {
                radioElement.className = (choice === 'yes') ? 'on' : 'off';
            }
            document.documentElement.style.setProperty('--flicker-animation', (choice === 'yes') ? 'running' : 'paused');
            window.localStorage.setItem('strobeAnimationChoice', choice);
            strobeWarningElement.style.opacity = '0';
            console.log(`Transform after setting is ${document.getElementById('strobe-warning-target').style.transform}`)
            setTimeout(() => {
                strobeWarningElement.style.display = 'none';
                document.documentElement.style.setProperty('--loadingbar-animation', 'running');
                callback();
                //self.bootScreen();
            }, transitionDuration);
        }
    }

    const makeChoiceNo = makeChoice('no');
    const makeChoiceYes = makeChoice('yes');
    noChoiceElement.addEventListener('click', makeChoiceNo);
    yesChoiceElement.addEventListener('click', makeChoiceYes);

    console.log(`SavedChoice is ${savedChoice}.`);

    if (useSaved && savedChoice !== null && savedChoice !== undefined) {
        const finalChoice = (savedChoice === 'yes') ? 'yes' : 'no';
        console.log(`Final choice is ${finalChoice}`);
        makeChoice(finalChoice, false)();
    }

    if (!alreadyShowing) {
        const saveTransition = 'all 300ms ease-in-out';
        strobeWarningElement.style.display = 'block';
        setTimeout(() => {
            strobeWarningSlideHandle.style.transition = '';
            strobeWarningElement.style.transition = '';
            setTimeout(() => {
                strobeWarningSlideHandle.style.transform = 'translate3d(0px, calc(100% * -1), 0px)';
                strobeWarningElement.style.opacity = 1;
                setTimeout(() => {
                    strobeWarningSlideHandle.style.transition = saveTransition;
                    strobeWarningElement.style.transition = saveTransition;
                    setTimeout(() => {
                        strobeWarningElement.style.transform = 'translate3d(0px, 0px, 0px)';
                    }, 20);
                }, 20);
            }, 20);
        }, 20);
    }
}

const menuIcon = <svg
width="40"
height="40"
viewBox="0 0 52.916665 52.916668"
version="1.1"
id="svg8">
<g transform="translate(0,-244.08332)">
 <path className="icon-path"
    style={{
        opacity: 1,
        fillOpacity: 1,
        stroke: 'none',
        strokeWidth: 12,
        strokeLinecap: 'square',
        strokeLinejoin: 'miter',
        strokeMiterlimit: 4,
        strokeDasharray: 'none',
        strokeDashoffset: 0,
        strokeOpacity: 1,
        paintOrder: 'markers fill stroke',
    }}
    d="M 7.6777344,8.5722656 V 55 H 44.285156 V 77.857422 H 7.6777344 V 124.28516 H 133.27344 v 21.78711 H 7.6777344 V 192.5 H 192.32227 v -46.42773 h -36.78711 v -21.78711 h 36.78711 V 77.857422 H 64.583984 V 55 H 192.32227 V 8.5722656 Z"
    transform="matrix(0.26458333,0,0,0.26458333,0,244.08332)" />
</g>
</svg>

class TabViewer extends React.Component {
    constructor(props) {
        super(props);
        bootTemplateFunc = bootTemplateFunc.bind(this);
        this.setState({
            firstOpen: true,
            lastTab: '',
            flickerAnimations: false,
            screenText: 'Accumulating data from the Aether Collective . . .',
        });
    }

    componentDidMount() {
        promptChoice(true, true, () => { this.bootScreen(); });
    }

    bootScreen() {
        const bootDuration = 0; //6000;
        const tabTransitionDuration = 400;
        const loadingbarDuration = 1600;
        const self = this;
        if (this.props.viewerId !== 'tab-scroll-target') {
            setTimeout(() => {
                self.setState({firstOpen: false});
            }, bootDuration + 10);
            return;
        }
        setTimeout(() => {
            const newScreenTextIndex = Math.floor(Math.random() * screenTextOptions.length);
            self.setState({screenText: screenTextOptions[newScreenTextIndex]});
            screenTextOptions.splice(newScreenTextIndex, 1);
            setTimeout(() => {
                const newScreenTextIndex = Math.floor(Math.random() * screenTextOptions.length);
                self.setState({screenText: screenTextOptions[newScreenTextIndex]});
            }, loadingbarDuration);
        }, loadingbarDuration);
        const endBootSequence = () => {
            console.log(`Ending boot sequence for ${this.props.viewerId}`);
            const element = document.getElementById(this.props.viewerId);
            //element.style.transformOrigin = 'top right';
            //element.style.transform = 'rotate(-90deg)';
            //element.style.opacity = 1;
            //const bootElement = document.getElementById(`${this.props.viewerId}-boot-screen`);
            const clonedTab = document.getElementById(`cloned-tab`);
            clonedTab.style.transformOrigin = 'top left';
            clonedTab.style.transform = 'rotate(0deg)';
            clonedTab.style.display = 'block';
            const realTab = document.getElementById(`tab-scroll-target`);
            const saveTransition = `all var(--tab-transition-duration) ease-in`;
            realTab.style.transition = 'all 0ms ease-in';
            //realTab.style.opacity = 0;
            realTab.style.transformOrigin = 'top right';
            setTimeout(() => {
                if (this.props.viewerId === 'tab-scroll-target') {
                    self.setState({firstOpen: false});
                }
                realTab.style.transform = 'rotate(-90deg)';
                //realTab.style.transition = saveTransition;
                setTimeout(() => {
                    console.log(`Current Transition="${realTab.style.transition}" Save Transition="${saveTransition}"`);
                    realTab.style.transition = saveTransition;
                    setTimeout(() => {
                        clonedTab.style.transform = 'rotate(90deg)';
                        realTab.style.transform = 'rotate(0deg)';
                        setTimeout(() => {
                            clonedTab.style.display = 'none';
                            //realTab.style.transform = 'rotate(0deg)';
                        }, 400);
                    }, 20);
                }, 20);
            }, 20);
            //element.style.opacity = 0;
            const openFirstTab = function(elem) {
                return () => {
                    self.setState({firstOpen: false});
                    elem.style.transform = 'rotate(0deg)';
                }
            }(element);
            //const saveTransition = element.style.transition;
            //element.style.transition = '';
            //element.style.transformOrigin = 'top right';
            //bootElement.style.transformOrigin = 'top left';
            /*setTimeout(() => {
                //element.style.transform = "rotate(-90deg)";
                setTimeout(() => {
                    //element.style.transition = saveTransition;
                    setTimeout(() => {
                        element.style.transform = 'rotate(0deg)';
                        bootElement.style.transform = 'rotate(90deg)';
                    }, 20);
                }, 20);
            }, 20);*/
            //bootElement.style.transition = 'all var(--tab-transition-duration) linear';
            //bootElement.style.transformOrigin = 'top left';
            //bootElement.style.transform = 'rotate(90deg)';
            //bootElement.style.opacity = 0;
            //setTimeout(openFirstTab, tabTransitionDuration)
        };
        setTimeout(endBootSequence, bootDuration);
    }

    componentDidUpdate() {
        console.log(`Tab="${this.props.tabChoice}" Theme="${this.props.themeChoice}" Mode="${this.props.modeChoice}"`);
    }

    toggleMenu(self) {
        return () => {
            const protocol = (self.state.lastTab === '' || self.state.lastTab === undefined) ? 'open' : 'close';
            const protocols = {
                'open': () => {
                    self.setState({lastTab: self.props.tabChoice});
                    self.props.setTabChoice('Main Menu');
                },
                'close': () => {
                    self.props.setTabChoice(self.state.lastTab);
                    self.setState({lastTab: ''});
                },
            };
            console.log(`Toggling menu with protocol ${protocol}`);
            protocols[protocol]();
        }
    }

    render() {
        const urlToTabChoice = {
            'r%C3%A9sum%C3%A9': 'Résumé',
            'project-1': 'Project 1',
            'project-2': 'Project 2',
            '?????': '?????',
        }

        return <div className="tab-master-wrapper">
            <div className="main-tab-viewer-wrapper" id={ this.props.viewerId }>
                <div style={{display: (this.state?.firstOpen === true || this.state?.firstOpen === undefined) ? 'none' : 'block'}} className={ `main-tab-viewer-spacer tab-is-${this.props.tabChoice}` }></div>
                { (this.state?.firstOpen === true || this.state?.firstOpen === undefined) ? bootTemplateFunc(this.state?.screenText || screenText, this.props.viewerId) : templates[this.props.tabChoice]() }
            </div>
            <div style={ {display: (this.state?.firstOpen === true || this.state?.firstOpen === undefined || this.props.viewerId === 'cloned-tab') ? 'none' : 'flex'} } className="main-tab-viewer-top-bar">
                <div className='main-menu-option top-bar-option'
                    onClick={ this.toggleMenu(this) }>
                    { menuIcon }
                </div>
                { Object.keys(urlToTabChoice).map(name =>
                    <div id={ `top-bar-${urlToTabChoice[name]}` } 
                        className={ `top-bar-option` }
                        style={ {display: (this.props.viewerId === 'cloned-tab') ? 'none' : 'grid'}}
                        onClick={ () => {console.log(`!!!!!`);this.props.setTabChoice(urlToTabChoice[name])} }>
                        <span>{ urlToTabChoice[name] }</span>
                    </div>
                )}
            </div>
        </div>
    }
}

export default TabViewer;