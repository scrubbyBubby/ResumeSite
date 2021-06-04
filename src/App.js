import { e } from 'mathjs';
import React, { useState } from 'react';
import './App.css';

import ControlBoard from './gui/control-board/control-board.js';
import ScrollControl from './gui/scroll-control/scroll-control.js';
import TabViewer from './gui/tab-viewer/tab-viewer.js';

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  var r = parseInt(result[1], 16);
  var g = parseInt(result[2], 16);
  var b = parseInt(result[3], 16);

  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
      h = s = 0; // achromatic
  } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: break;
      }
      h /= 6;
  }

  s = s*100;
  s = Math.round(s);
  l = l*100;
  l = Math.round(l);
  h = Math.round(360*h);
  
  return {
    h: h,
    s: s,
    l: l,
  }
}

const strobeAnimationList = [
  'jigglelightcast',
  'flickerbrightness',
  'jiggleinnerslidehandleshadow',
  'jiggleshadowstrongtall',
  'shakeshadow',
  'jiggleshadow',
  'jiggleshadowstrongwide',
  'jiggleangleshadow',
  'jiggleinnercurvedslidehandleshadow',
  'jiggletopcurvedslidehandle',
  'jigglebottomcurvedslidehandle',
  'jiggleouterdialshadow',
  'jiggleinnerdialshadow',
  'loadingbar',
];

const urlToTabChoice = {
    'r%C3%A9sum%C3%A9': 'Résumé',
    'project-1': 'Project 1',
    'project-2': 'Project 2',
    '?????': '?????',
}

function App() {

  const themeHueRotations = {
    'green': 0,
    'yellow': -71,
    'blue': 83,
    'purple': 140,
  };

  const baseThemes = {
    dark: { //Colors must be hex. Will be converted to hsl and rotated to create themes
      'background-0-background-color': '#2a4630',
      'background-0-border-color': '#0c311b',
      'background-0-inner-border-color': '#1b703d',
      'background-bar-color': '#062914',
      'main-text-color': '#adfaaa',
      'backlight-cast-color': '#adfaaa',
    },
    light: {
      'background-0-background-color': '#a4d3a2',
      'background-0-border-color': '#0c311b',
      'background-0-inner-border-color': '#2cb763',
      'background-bar-color': '#59d189',
      'main-text-color': '#1a2b1e',
      'backlight-cast-color': '#adfaaa',
    }
  }

  let initialTheme = (window.localStorage !== undefined && window.localStorage !== null) ?
    window.localStorage.getItem('themeChoice') : 'green';

  initialTheme = (Object.keys(themeHueRotations).indexOf(initialTheme) !== -1) ?
    initialTheme : 'green';

  let initialMode = (window.localStorage !== undefined && window.localStorage !== null) ?
    window.localStorage.getItem('modeChoice') : 'dark';
  
  initialMode = (Object.keys(baseThemes).indexOf(initialMode) !== -1) ?
    initialMode : 'dark';

  const pathname = window.location.pathname.substring(1);
  const initialChoice = urlToTabChoice[pathname] || 'Résumé';
  const [tabChoice, setTabChoice] = useState(initialChoice);
  const [clonedTabChoice, setClonedTabChoice] = useState(initialChoice)
  const [themeChoice, setThemeChoice] = useState(initialTheme);
  const [modeChoice, setModeChoice] = useState(initialMode);

  const setHueRotation = (choice, mode) => {
    mode = (mode === undefined) ? modeChoice : mode;
    console.log(`ModeChoice is ${modeChoice} and mode is ${mode}`);
    const hueRotation = themeHueRotations[choice];
    const stylings = Object.keys(baseThemes[mode]);
    console.log(`Choice is ${choice}. Setting hue rotation to ${hueRotation} for [${JSON.stringify(stylings)}]`);
    stylings.forEach(style => {
      const styleValue = baseThemes[mode][style];
      const hslObject = hexToHSL(styleValue);
      hslObject.h += hueRotation;
      const newValue = hslToHex(hslObject.h, hslObject.s, hslObject.l);
      console.log(`New value for ${styleValue} is ${newValue}.`);
      document.documentElement.style.setProperty(`--${style}`, `${newValue}`);
    })
  }

  const oldSuperSetTabChoice = (choice) => {
    console.log(`Setting tab choice to ${choice}.`);
    if (choice !== tabChoice && clonedTabChoice === tabChoice) {
      let randomSign = (Math.random() < 0.5) ? -1 : 1;
      const element = document.getElementById(`tab-scroll-target`);
      const cloneElement = document.getElementById(`cloned-tab`);
      //element.style.display = 'none';
      //cloneElement.style.display = 'block';
      console.log(`Just set clonedTabs display to ${cloneElement.style.display}`);
      const baseTransition = 'opacity 200ms linear';
      const fullTransition = `${baseTransition}, transform var(--tab-transition-duration) linear`;
      //element.style.transform = 'rotate3d(0, 1, 0, 92deg)';
      element.style.opacity = '0';
      //element.style.transform = `scale(1) skewX(${-80 * randomSign}deg) scaleY(0)`;
      element.style.transform = `scaleY(0)`;
      setTimeout(() => {
        setTabChoice(choice);
        setClonedTabChoice(choice);
        element.style.transition = baseTransition;
        setTimeout(() => {
          //element.style.transformOrigin = 'top right';
          //element.style.transform = 'rotate3d(0, 1, 0, -92deg)';
          element.style.opacity = '0';
          //element.style.transform = `scale(0.9) skewX(${-2 * randomSign}deg) scaleY(1)`;
          element.style.transform = `scaleY(0.9) scaleX(1)`;
          setTimeout(() => {
            element.style.transition = fullTransition;
            setTimeout(() => {
              element.style.opacity = '1';
              //element.style.transform = 'scale(1) skewX(0deg)';
              element.style.transform = `scaleY(1) scaleX(1)`;
              //element.style.transform = 'rotate3d(0, 1, 0, 0deg)';
              setTimeout(() => {
                //element.style.transformOrigin = 'top left';
              }, 300);
            });
          }, 20)
        }, 20)
      }, 300);
    }
  }

  const superSetTabChoice = (choice) => {
    console.log(`Super setting tab choice to ${choice}`);
    if (choice !== tabChoice) {
      const tabChoices = ['Main Menu', 'Résumé', 'Project 1', 'Project 2', '?????',];
      const tabChoiceIndex = tabChoices.indexOf(tabChoice);
      const choiceIndex = tabChoices.indexOf(choice);
      let randomSign = (choiceIndex > tabChoiceIndex) ? -1 : 1;
      let direction = (randomSign === -1) ? 'left' : 'right';
      let oppositeDirection = (randomSign === 1) ? 'left' : 'right';
      const element = document.getElementById(`tab-scroll-target`);
      const cloneElement = document.getElementById(`cloned-tab`);
      const baseTransition = `all var(--tab-transition-duration) ease-in`;
      let transitionDuration = getComputedStyle(document.documentElement)
        .getPropertyValue(`--tab-transition-duration`).split("ms")[0];
      transitionDuration = Number(transitionDuration);

      const baseScroll = element.scrollTop;
      console.log(`BaseScroll is ${baseScroll}`);
      const maxScroll = element.scrollHeight - element.offsetHeight;
      const scrollPercentage = Math.round((element.scrollTop * 100) / maxScroll) / 100;

      let slideIntCount = 0;
      const slideDuration = (element.scrollTop <= 200) ? 100 :
        (element.scrollTop <= 500) ? 200 : 300;
      const slideTimestep = 20;
      //Use a slide interval to manually move the slide handle and scroll position on the page?
      //Just check to see if this affects clicking and dragging or normal scrolling 
      const slideSteps = slideDuration / slideTimestep;
      const currentScroll = element.scrollTop;
      const slideInt = setInterval(() => {
        slideIntCount++;
        const newScroll = (currentScroll * (slideSteps - slideIntCount) / slideSteps);
        console.log(`Setting newScroll="${newScroll}"`);
        element.scrollTop = newScroll;
        if (slideIntCount >= slideSteps) {
          clearInterval(slideInt);
        }
      }, slideTimestep);
      setTimeout(() => {
        element.style.transition = '';
        cloneElement.style.transition = '';
        cloneElement.style.scrollBehavior = 'auto';
        setTimeout(() => {
          console.log(`The clone element is invisible, but in position.`);
          setTimeout(() => {
            element.style.display = 'none';
            cloneElement.style.display = 'block';
            //cloneElement.scrollTop = 0;
            cloneElement.style.transform = `rotate(0deg)`;
            cloneElement.style.transformOrigin = `${direction} top`;
            element.style.transform = `rotate(${randomSign * 90}deg)`;
            console.log(`The clone element has now replaced the tab element!`);
            setTabChoice(choice); 
            setTimeout(() => {
              console.log(`Setting clone element's scroll top to ${baseScroll}`);
              element.style.transformOrigin = `${oppositeDirection} top`;
              element.style.display = 'block';
              //element.scrollTop = 0;
              setTimeout(() => {
                element.style.transition = baseTransition;
                cloneElement.style.transition = baseTransition;
                cloneElement.style.scrollBehavior = 'smooth';
                console.log(`The base transitions have been restored.`);
                setTimeout(() => {
                  console.log(`CloneElement ScrollTop is ${cloneElement.scrollTop}`);
                  element.style.transform = `rotate(0deg)`;
                  cloneElement.style.transform = `rotate(${randomSign * -90}deg)`;
                  console.log(`Moving the cloned and original elements.`);
                  setTimeout(() => {
                    cloneElement.style.display = 'none';
                    console.log(`Cleaning up.`);
                    setTimeout(() => {
                      setClonedTabChoice(choice);
                    }, 20)
                  }, transitionDuration);
                }, 20)
              }, 50);
            }, 20);
          }, 20);
        }, 20);
      }, slideDuration);
    }
  }

  const superSetThemeChoice = (choice) => {
    console.log(`Setting theme choice to ${choice}...`);
    setThemeChoice(choice);
    setHueRotation(choice);
    window.localStorage.setItem('themeChoice', choice);
    console.log(`Theme choice has been set to ${choice}...`);
  }

  const superSetModeChoice = (choice) => {
    console.log(`Setting mode choice to ${choice}`);
    setModeChoice(choice);
    setHueRotation(themeChoice, choice);
    window.localStorage.setItem('modeChoice', choice);
    document.documentElement.style.setProperty('--backlight-cast-blur', (choice === 'dark') ? '250px' : '400px');
    document.documentElement.style.setProperty('--backlight-cast-spread', (choice === 'dark') ? '-80px' : '-20px');
  }

  const missionStatement = {
    header: 'What is any of this?',
    text: `Resume's are useful, but ultimately not that interesting. I wanted to find a way to make a Resume that could show off my abilities in a way that was fresh, thematic, and fun. In addition to acting as a Resume, this site functions as a hub linking all of my projects and sites. In the future it will be updated with new sites or projects that I'm working on. If you like the site or are interested in having me make a site for you, reach out to me.`,
  }

  const closeMissionStatement = () => {
    const missionStatement = document.getElementById(`mission-statement`);
    const missionStatementBox = document.getElementById(`mission-statement-box`);

    missionStatement.style.opacity = '0';
    setTimeout(() => {
      missionStatement.style.display = 'none';
    }, 500);
  }

  return (
    <div className="background-0">
      <div className="background-sub-wrapper">
        <div className={ `background-1 ${(modeChoice === 'light') ? 'light-mode' : 'dark-mode'}` }>
          <div className="background-sub-wrapper">
            <div className="tab-wrapper" style={ {opacity: (modeChoice === 'dark') ? '0.5' : '1'} }>
              <div className="tab-sub-wrapper">
                <TabViewer
                  viewerId={ `tab-scroll-target` }
                  tabChoice={ tabChoice }
                  setTabChoice={ superSetTabChoice }
                  themeChoice={ themeChoice }
                  setThemeChoice={ superSetThemeChoice }
                  modeChoice={ modeChoice }
                  setModeChoice={ superSetModeChoice }></TabViewer>
                <TabViewer
                  viewerId={ `cloned-tab` }
                  tabChoice={ clonedTabChoice }
                  setTabChoice= { () => {} }
                  themeChoice={ themeChoice }
                  setThemeChoice={ () => {} }
                  modeChoice={ modeChoice }
                  setModeChoice={ () => {} }></TabViewer>
              </div>
            </div>
            <div className="background-2"></div>
            <div className="background-2 rotate-gradient"></div>
            <div className="background-2 reverse-rotate-gradient"></div>
          </div>
        </div>
        <div className="main-control-board">
          <ControlBoard 
            tabChoice={ tabChoice } 
            setTabChoice={ superSetTabChoice }
            themeChoice={ themeChoice }
            setThemeChoice={ superSetThemeChoice }
            modeChoice={ modeChoice }
            setModeChoice={ superSetModeChoice }></ControlBoard>
        </div>
        <div className="side-scroll-control">
          <ScrollControl></ScrollControl>
        </div>
      </div>
      { Object.keys(themeHueRotations).map(themeName => 
        <div style={ {filter: `hue-rotate(${themeHueRotations[themeName]}deg)`} }
          className={ `background-theme-light-cast ${(themeChoice === themeName) ? '' : 'disabled-light-cast'}` }>
        </div>
      )}
      <div className="strobe-warning-wrapper" id="strobe-warning">
        <div className="strobe-warning-sub-wrapper">
          <div className="strobe-warning-wide-sub-wrapper">
            <div className="strobe-warning" id="strobe-warning-slide-handle">
              <div className="strobe-warning-text" id='strobe-warning-target'>
                This webpage utilizes flashing lights for some effects. These lights could potentially trigger individuals with photosensitive disorders. Would you like to turn on these animations?
              </div>
              <div className="strobe-warning-buttons">
                <div className="choose-no" id="strobe-choice-no">Keep Off</div>
                <div className="choose-yes" id="strobe-choice-yes">Turn On</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mission-statement-wrapper" id="mission-statement">
        <div className="mission-statement-sub-wrapper">
          <div className="mission-statement" id="mission-statement-box">
            <div className="mission-statement-header">{ missionStatement.header }</div>
            <div className="mission-statement-text">{ missionStatement.text }</div>
            <div className="mission-statement-buttons">
              <div onClick={ closeMissionStatement } className="button">Got it!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
