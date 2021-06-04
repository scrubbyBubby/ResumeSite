import React from 'react';
import './scroll-control.css';

import { create, all } from 'mathjs'

// create a mathjs instance with configuration
const config = {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'number',
  precision: 64,
  predictable: false,
  randomSeed: null
}
const math = create(all, config)

class ScrollControl extends React.Component {
    constructor() {
        super();
        this.state = {
            drag: false,
            moving: false,
        }

        this.startDrag = this.startDrag.bind(this);
        this.startDragMobile = this.startDragMobile.bind(this);
        this.startDragDesktop = this.startDragDesktop.bind(this);
        this.moveToLocation = this.moveToLocation.bind(this);
        this.warpToLocation = this.warpToLocation.bind(this);
        this.recalculateShadowTilt = this.recalculateShadowTilt.bind(this);
        this.moveScroll = this.moveScroll.bind(this);

        this.slideHandlesMoving = [];

        this.scrollHandleId = 'main-side-scroll';
        this.translateRegEx = /translate3d\((-?[\d|.]+)px, (-?[\d|.]+)px, (-?[\d|.]+)px\)/;
        this.tabViewerRect = undefined;
        this.yTilt = {
            max: -8,
            min: -14,
        }
        this.xTilt = {
            max: 13,
            min: 8,
        }
        this.mousePos = {
            x: 0, 
            y: 0,
        }
    }

    componentDidMount() {
        const self = this;
        this.tabViewerRect = document.getElementById('tab-scroll-target').getBoundingClientRect();
        const setNewDragTarget = (e) => {
            const insideX = (self.mousePos.x >= this.tabViewerRect.left && self.mousePos.x <= this.tabViewerRect.left + this.tabViewerRect.width) ? true : false;
            const insideY = (self.mousePos.y >= this.tabViewerRect.top && self.mousePos.y <= this.tabViewerRect.top + this.tabViewerRect.height + 100) ? true : false;
            console.log(`self.mousePos.x="${self.mousePos.x}" this.tabViewerRect.left="${this.tabViewerRect.left}" this.tabViewerRect.width="${this.tabViewerRect.width}" this.tabViewerRect.left + this.tabViewerRect.width="${this.tabViewerRect.left + this.tabViewerRect.width}"`);
            console.log(`self.mousePos.y="${self.mousePos.y}" this.tabViewerRect.top="${this.tabViewerRect.top}" this.tabViewerRect.height="${this.tabViewerRect.height}" this.tabViewerRect.top + this.tabViewerRect.height="${this.tabViewerRect.top + this.tabViewerRect.height}"`);
            console.log(`insideX="${insideX}" insideY="${insideY}"`);
            if (!this.state.moving && insideX && insideY) {
                const element = document.getElementById('tab-scroll-target');
                const scrollTop = element.scrollTop;
                const maxScroll = element.scrollHeight - element.offsetHeight;
                const percentage = Number(scrollTop * 100 / maxScroll).toFixed(2);
                console.log(`ScrollTop="${scrollTop}" maxScroll="${maxScroll}" percentage="${percentage}"`);
                const dragElement = document.getElementById(this.scrollHandleId);
                const dragParent = dragElement.parentElement;
                const maxXY = dragParent.offsetHeight - dragElement.offsetHeight;
                const targetLocation = maxXY * percentage * 0.01;
                self.warpToLocation(targetLocation, undefined, false);
            }
        }

        document.getElementById('tab-scroll-target').addEventListener('scroll', setNewDragTarget);
        document.addEventListener('mousemove', (e) => {
            self.mousePos = {
                x: e.pageX,
                y: e.pageY,
            }
        })
    }

    assembleBoxShadow(shadowObject) {
        const propertyList = ['inset', 'hOffset', 'vOffset', 'blur', 'spread', 'color'];
        const defaultValues = {
            'inset': '', 
            'hOffset': '0px',
            'vOffset': '0px',
            'blur': '0px',
            'spread': '0px',
            'color': '#000',
        }

        let acc = '';
        for (var i = 0; i<propertyList.length; i++) {
            const cur = propertyList[i];
            if (acc.length > 0) {
                acc += ' ';
            }
            acc += `${shadowObject[cur] === undefined ? defaultValues[cur] : `${shadowObject[cur]}`}`;
            console.log(`AssemblingBoxShadow with acc="${acc}"`);
        }
        return acc;
    }

    disassembleBoxShadow(boxShadow) {
        const inset = (boxShadow.substring(0,5) === 'inset') ? true : false;
        if (inset) {boxShadow = boxShadow.substring(6)};
        const colorRegEx = /(rgba\([\w|\W]+\))/;
        const colorArray = colorRegEx.exec(boxShadow);
        const otherRegEx = /(-?[\d|.]+px) (-?[\d|.]+px) (-?[\d|.]+px) (-?[\d|.]+px)/;
        const otherArray = otherRegEx.exec(boxShadow);
        //const shadowArray = /(\d+px) (\d+px) (\d+px) (\d+px) (rgba\([\w|\W]+\))/.exec(boxShadow);
        const shadowObject = {
            inset: (inset) ? 'inset':'',
            hOffset: otherArray[1],
            vOffset: otherArray[2],
            blur: otherArray[3],
            spreads: otherArray[4],
            color: colorArray[1],
        }
        return shadowObject;
    }

    recalculateShadowTilt(elementID, vertical, both) {
        both = (both === undefined) ? true : both;
        vertical = (vertical === undefined) ? false : vertical;
        const slideHandleElement = document.getElementById(elementID);
        const shadowElement = document.getElementById(`${elementID}-shadow`);
        const parentElement = slideHandleElement.parentNode;
        const transform = slideHandleElement.style.transform || `translate3d(0px, 0px, 0px)`;
        const translateArray = this.translateRegEx.exec(transform);
        console.log(`TranslateArray="${JSON.stringify(translateArray)}`)
        const initialXYOffset = Number(translateArray[(vertical) ? 2 : 1]) + slideHandleElement[(vertical) ? 'offsetTop' : 'offsetLeft'];
        const offsetString = `offset${(vertical) ? 'Height' : 'Width'}`;
        const maxXY = parentElement[offsetString] - slideHandleElement[offsetString];
        const percentage = Math.floor(((initialXYOffset * 1.0) / (maxXY * 1.0)) * 100) * 0.01;
        const tiltRange = this[`${(vertical) ? 'y' : 'x'}Tilt`].max - this[`${(vertical) ? 'y' : 'x'}Tilt`].min;
        const tiltValue = (percentage * tiltRange) + this[`${(vertical) ? 'y' : 'x'}Tilt`].min;
        const altTiltRange = this[`${(vertical) ? 'x' : 'y'}Tilt`].max - this[`${(vertical) ? 'x' : 'y'}Tilt`].min;
        const altTiltValue = (percentage * altTiltRange) + this[`${(vertical) ? 'x' : 'y'}Tilt`].min;

        const oldShadowObject = this.disassembleBoxShadow(shadowElement.style.boxShadow);
        oldShadowObject[vertical ? 'vOffset' : 'hOffset'] = `${Math.floor(tiltValue * 100) * 0.01}px`;
        if (both) {
            oldShadowObject[vertical ? 'hOffset' : 'vOffset'] = `${Math.floor(altTiltValue * 100) * 0.01}px`;
        }
        console.log(`Both is ${both} and oldShadowObject is ${JSON.stringify(oldShadowObject)}`);
        const newShadow = this.assembleBoxShadow(oldShadowObject);
        //const newShadow = `${(!vertical) ? tiltValue : 20}px ${(vertical) ? tiltValue : 20}px 7px 0px rgba(0, 0, 0, 0.5)`;
        shadowElement.style.boxShadow = newShadow;
    }

    startDragMobile(e) {
        //e.preventDefault();
        this.startDrag(e, this.scrollHandleID, true, true);
    }

    startDragDesktop(e) {
        e.preventDefault();
        this.startDrag(e, this.scrollHandleID, true, false);
    }

    warpToLocation(yTarget, duration, percentTarget) {
        percentTarget = (percentTarget === undefined) ? false : percentTarget;
        console.log(`Warping scroll control to a location...`);
        console.log(`yTarget="${yTarget}" duration="${duration}" percentTarget="${percentTarget}"`);
        const handleId = this.scrollHandleId;
        const slideHandleElement = document.getElementById(handleId);
        const initialTransformString = slideHandleElement.style.transform || `translate3d(0px, 0px, 0px)`;
        const initialTransformArray = initialTransformString.split(') ').filter(name => {
            return name.substring(0, String('translate3d').length) !== 'translate3d';
        });
        console.log(`Initial transform array ${JSON.stringify(initialTransformArray)}`);
        console.log(`InitialTransformString="${initialTransformString}"`);
        let [, initialX, initialY, initialZ] = this.translateRegEx.exec(initialTransformString);
        initialX = Number(initialX).toFixed(2);
        initialY = Number(initialY).toFixed(2);
        initialZ = Number(initialZ).toFixed(2);
        if (percentTarget === true) {
            const parentElement = slideHandleElement.parentElement;
            const maxY = parentElement.offsetHeight - slideHandleElement.offsetHeight;
            console.log(`yTarget="${yTarget}" maxY="${maxY}`);
            yTarget = (yTarget / 100) * maxY;
        }
        console.log(`yTarget="${yTarget}"`);
        let newTransform = `translate3d(${initialX}px, ${yTarget}px, ${initialZ}px)`;
        initialTransformArray.forEach((name, index) => {
            console.log(`Posting ${name} to transform`);
            newTransform += `${name}`;
            if (name[name.length - 1] !== ")") {
                newTransform += ")";
            }
            newTransform += " ";
        })
        slideHandleElement.style.transform = newTransform;
        console.log(`Posted transform is ${newTransform}`);
        this.recalculateShadowTilt(this.scrollHandleId, true);
    }

    moveToLocation(yTarget, duration, percentTarget) {
        percentTarget = (percentTarget === undefined) ? false : percentTarget;
        console.log(`Moving scroll control to a location...`);
        console.log(`yTarget="${yTarget}" duration="${duration}" percentTarget="${percentTarget}"`);
        const handleId = this.scrollHandleId;
        const slideHandleElement = document.getElementById(handleId);
        const initialTransformString = slideHandleElement.style.transform || `translate3d(0px, 0px, 0px)`;
        console.log(`InitialTransformString="${initialTransformString}"`);
        let [, initialX, initialY, initialZ] = this.translateRegEx.exec(initialTransformString);
        initialX = Number(initialX).toFixed(2);
        initialY = Number(initialY).toFixed(2);
        initialZ = Number(initialZ).toFixed(2);
        if (percentTarget === true) {
            const parentElement = slideHandleElement.parentElement;
            const maxY = parentElement.offsetHeight - slideHandleElement.offsetHeight;
            console.log(`yTarget="${yTarget}" maxY="${maxY}`);
            yTarget = (yTarget / 100) * maxY;
        }
        console.log(`yTarget="${yTarget}" initialY="${initialY}`);
        let [xChange, yChange] = [0, yTarget - initialY];
        console.log(`xChange="${xChange}" yChange="${yChange}"`);
        this.moveSlideHandle(handleId, xChange, yChange, duration);
    }

    interpolateArray(targetArray, numberOfPoints) {
        const targetArrayLength = targetArray.length;
        console.log(`targetArrayLength="${targetArrayLength}" numberOfPoints="${numberOfPoints}"`);
        const newArray = [];
        const lengthConversion = Number(targetArrayLength - 1) / Number(numberOfPoints - 1);
        console.log(`targetArrayLength="${targetArrayLength}" numberOfPoints="${numberOfPoints}" lengthConversion="${lengthConversion}"`);
        for (var i = 1; i <= Number(numberOfPoints); i++) {
            console.log(`Interpolating point ${i}`);
            let newArrayValue = undefined;
            const convertedLength = Number(i - 1) * lengthConversion;
            const onPoint = (Math.abs(Number(convertedLength) - Math.round(convertedLength)) <= 0.01) ? true : false;
            console.log(`convertedLength="${convertedLength}" onPoint="${onPoint}"`);
            if (onPoint) {
                newArrayValue = targetArray[Math.round(convertedLength)];
            } else {
                const point1Index = Math.floor(convertedLength);
                const point2Index = Math.ceil(convertedLength);
                const point1 = targetArray[point1Index];
                const point2 = targetArray[point2Index];
                const simpleSlope = (Number(point2) - Number(point1));
                const fractionalProjectedPoint = (Number(convertedLength) - Number(point1Index));
                const simpleProjectedPoint = Number(point1) + (fractionalProjectedPoint * Number(Number(point2) - Number(point1)));
                const flexibilityFactor = (1 - (4 *((fractionalProjectedPoint - 0.5) * (fractionalProjectedPoint - 0.5)))) * 0.02; //Inverse parabola with peak at 0.5 and x-intercepts at 0 and 1, then divided by 50
                const stiffnessFactor = 1;
                const projectedAdjacentPoint1 = Number(point1) + (Number(simpleSlope) * (-1));
                const projectedAdjacentPoint2 = Number(point2) + (Number(simpleSlope) * 1);
                const adjacentPoint1 = (point1Index - 1 >= 0) ? targetArray[point1Index - 1] : projectedAdjacentPoint1;
                const adjacentPoint2 = (point2Index + 1 >= targetArray.length) ? targetArray[point2Index - 1] : projectedAdjacentPoint2;
                const adjacentPoint1Adjustment = -Number(Number(adjacentPoint1) - Number(projectedAdjacentPoint1)) * (flexibilityFactor / stiffnessFactor);
                const adjacentPoint2Adjustment = -Number(Number(adjacentPoint2) - Number(projectedAdjacentPoint2)) * (flexibilityFactor / stiffnessFactor);
                const finalProjectedPoint = simpleProjectedPoint + adjacentPoint1Adjustment + adjacentPoint2Adjustment;
                console.log(`point1Index="${point1Index}" point2Index="${point2Index}" point1="${point1}" point2="${point2}" simpleSlope="${simpleSlope}" fractionalProjectedPoint="${fractionalProjectedPoint}"`);
                console.log(`simpleProjectedPoint="${simpleProjectedPoint}" flexibilityFactor="${flexibilityFactor}" stiffnessFactor="${stiffnessFactor}" projectedAdjacentPoint1="${projectedAdjacentPoint1}" projectedAdjacentPoint2="${projectedAdjacentPoint2}"`);
                console.log(`adjacentPoint1="${adjacentPoint1}" adjacentPoint2="${adjacentPoint2}" adjacentPoint1Adjustment="${adjacentPoint1Adjustment}" adjacentPoint2Adjustment="${adjacentPoint2Adjustment}" finalProjectedPoint="${finalProjectedPoint}"`);
                newArrayValue = finalProjectedPoint;
            }
            if (newArrayValue !== undefined) {
                console.log(`Pushing value ${newArrayValue} to array...`);
                newArray.push(newArrayValue.toFixed(2));
            }
        }
        console.log(`Interpolated array is ${JSON.stringify(newArray)}`);
        return newArray;
    }

    normalizeArray(targetArray, float) {
        float = (float === undefined) ? 2 : float;
        const arrayTotal = targetArray.reduce((acc,cur) => Number(acc) + Number(cur));
        const multiplier = targetArray.length / Number(arrayTotal);
        const newArray = targetArray.map(value => (Number(value) * Number(multiplier)).toFixed(float));
        return newArray;
    }

    moveSlideHandle(handleID, xChange, yChange, time, minSpeed) {
        xChange = Number(xChange).toFixed(2);
        yChange = Number(yChange).toFixed(2);
        console.log(`Moving slide handle with xChange="${xChange}" yChange="${yChange}"`);
        if (xChange == 0 && yChange == 0) {
            return;
        }
        time = (time === undefined) ? 300 : time;
        minSpeed = (minSpeed === undefined) ? 3 : minSpeed;
        const xDirection = (xChange == 0) ? 1 : (xChange) / Math.abs(xChange);
        const yDirection = (yChange == 0) ? 1 : (yChange) / Math.abs(yChange);
        console.log(`XDirection ${xDirection} and yDirection ${yDirection}`);
        if (this.slideHandlesMoving.indexOf(handleID) === -1) {
            this.slideHandlesMoving = this.slideHandlesMoving.concat([handleID]);
        }
        const timestep = 10;
        const steps = Math.ceil(time / timestep) + 1;
        const slideHandleElement = document.getElementById(handleID);
        const initialTransformString = slideHandleElement.style.transform || `translate3d(0px, 0px, 0px)`;
        console.log(`InitialTransformString="${initialTransformString}"`);
        const initialTransformArray = initialTransformString.split(') ').filter(name => {
            return name.substring(0, String('translate3d').length) !== 'translate3d';
        });
        let [, initialX, initialY, initialZ] = this.translateRegEx.exec(initialTransformString);
        initialX = Number(initialX).toFixed(2);
        initialY = Number(initialY).toFixed(2);
        initialZ = Number(initialZ).toFixed(2);
        let step = 0;
        const animationWeightArrays = {
            'ease-in-out': [1, 1.05, 1.1, 1.2, 1.3, 1.35, 1.3, 1.2, 1.1, 1.05, 1],
        };
        const animation = 'ease-in-out';
        let animationWeightArray = animationWeightArrays[animation];
        animationWeightArray = this.normalizeArray(this.interpolateArray(animationWeightArray, steps));
        console.log(`Animation Weight Array is ${JSON.stringify(animationWeightArray)}`);
        const xMovementHistory = [];
        let lastNewX = initialX; let lastNewY = initialY;
        let xCompleted = false, yCompleted = false;
        let baseTransform = '';
        initialTransformArray.forEach(name => {
            baseTransform += `${name}) `;
        })
        const intervalFunction = function(self) {
            return () => {
                step++;
                console.log(`Moving step ${step}`);
                if (step > 100) {
                    clearInterval(int);
                    return;
                }
                console.log(`InitialX="${Number(initialX)}" step="${step}" steps="${steps}" step/steps="${Number(step / steps)}" xChange="${Number(xChange)}"`);
                console.log(`step/steps * xChange="${Number(Number(step / steps) * Number(xChange))}" initialX+(step/steps)*xChange="${Number(initialX) + Number(Number(step / steps) * Number(xChange))}" convertedToNumber="${Number(Number(initialX) + Number(Number(step / steps) * Number(xChange)))}" toFixed="${Number(Number(initialX) + Number(Number(step / steps) * Number(xChange))).toFixed(2)}"`);
                const xDiff = Number(Number(1 / steps) * Number(xChange) * (animationWeightArray[step - 1] || 1)).toFixed(2);
                const yDiff = Number(Number(1 / steps) * Number(yChange) * (animationWeightArray[step - 1] || 1)).toFixed(2);
                console.log(`initialX="${initialX}" lastNewX="${lastNewX}" xDiff="${xDiff}"`);
                let newX = Number(Number(lastNewX) + Number(xDiff)).toFixed(2);
                let newY = Number(Number(lastNewY) + Number(yDiff)).toFixed(2);
                console.log(`newX="${newX}" newY="${newY}"`);
                console.log(`Comparing newX="${newX}" with maxX="${Number(initialX) + Number(xChange)}"`);
                if (!xCompleted) {
                    console.log(`xDirection="${xDirection}" newX="${newX}" initialX="${initialX}" xChange="${xChange}"`);
                    xCompleted = ((Number(xDirection) * newX) >= (Number(xDirection) * (Number(initialX) + Number(xChange)))) ? true : false;
                    if (xCompleted) {
                        newX = Number(Number(initialX) + Number(xChange)).toFixed(2);
                    }
                }
                if (!yCompleted) {
                    yCompleted = ((Number(yDirection) * newY) >= (Number(yDirection) * (Number(initialY) + Number(yChange)))) ? true : false;
                    if (yCompleted) {
                        newY = Number(Number(initialY) + Number(yChange)).toFixed(2);
                    }
                }
                const newTransform = `${baseTransform}translate3d(${newX}px, ${newY}px, ${initialZ}px)`;
                xMovementHistory.push(newX);
                slideHandleElement.style.transform = newTransform;
                self.recalculateShadowTilt(handleID, false);
                console.log(`After move xCompleted="${xCompleted}" yCompleted="${yCompleted}"`);
                lastNewX = Number(newX);
                lastNewY = Number(newY);
                if (xCompleted && yCompleted) {
                    xMovementHistory.forEach((x, i) => console.log(`${i}: ${x}, weight: ${animationWeightArray[i]}`));
                    clearInterval(int);
                }
            }
        }(this);
        const int = setInterval(intervalFunction, timestep);
    }

    startDrag(e, elementID, vertical, mobile) { //Convert to general form for both vertical and horizontal scrolling and any scrollHandleID
        mobile = (mobile === undefined) ? false : mobile;
        vertical = (vertical === undefined) ? this.vertical : vertical;
        elementID = (elementID === undefined) ? this.scrollHandleId : elementID;
        console.log(`ElementID is ${elementID}`);
        if (this.state.drag !== true) {
            //e.preventDefault();
            this.setTabScrollType('auto');
            this.setState({drag: true});
            console.log(`Dragging has begun!`)
            console.log(`CurrentTarget elementID is ${elementID}`);
            const currentTarget = (mobile) ? e.targetTouches.item(0) : e.currentTarget;
            const screenTarget = (mobile) ? currentTarget : e;
            const xy = screenTarget[(vertical) ? 'screenY' : 'screenX'];
            const dragElement = document.getElementById(elementID);
            dragElement.style.cursor = 'inherit';
            document.body.style.cursor = "grabbing";
            const initialTranslate = dragElement.style.transform || `translate3d(0px, 0px, 0px)`;
            console.log(`InitialTranslate is ${initialTranslate}`);
            const [, initialX, initialY, initialZ] = this.translateRegEx.exec(initialTranslate);
            const initialXYOffset = Number((vertical) ? initialY || 0 : initialX || 0) + dragElement[(vertical) ? 'offsetTop' : 'offsetLeft'];
            //const initialXYOffset = Number(translateArray[(vertical) ? 2 : 1]) + dragElement[(vertical) ? 'offsetTop' : 'offsetLeft'];
            const parentElement = dragElement.parentNode;
            const offsetType = (vertical) ? 'offsetHeight' : 'offsetWidth';
            const maxXY = parentElement[offsetType] - dragElement[offsetType];
            let moveDragElement = function(xy, maxXY, self) {
                return e2 => {
                    const currentTarget2 = (mobile) ? e2.changedTouches.item(0) : e2.currentTarget;
                    const screenTarget2 = (mobile) ? currentTarget2 : e2;
                    const xy2 = screenTarget2[(vertical) ? 'screenY' : 'screenX'];
                    console.log(`IntialOffset: ${initialXYOffset} | xy2: ${xy2} | xy: ${xy}`);   
                    let xyOffset = initialXYOffset + xy2 - xy;
                    xyOffset = Math.floor(xyOffset * 100) * 0.01;
                    console.log(`xyOffset is first ${xyOffset}`);
                    xyOffset = (xyOffset < 0) ? 0 :
                        (xyOffset > maxXY) ? maxXY : xyOffset;
                    console.log(`then ${xyOffset}`);
                    const actualXOffset = (!vertical) ? xyOffset : 0;
                    const actualYOffset = (vertical) ? xyOffset : 0;
                    self.warpToLocation(actualYOffset, undefined, false);
                    //const newTransform = `translate3d(${actualXOffset}px, ${actualYOffset}px, 0px)`;
                    self.setTabScroll(actualYOffset, false);
                    //console.log(`New transform is ${newTransform}`);
                    //dragElement.style.transform = newTransform;
                    self.recalculateShadowTilt(elementID, vertical);
                }
            }(xy, maxXY, this);
            if (mobile) {
                console.log(`Setting detector for touchmove...`);
                document.addEventListener('touchmove', moveDragElement);
            } else {
                console.log(`Setting detector for mousemove...`);
                document.addEventListener('mousemove', moveDragElement);
            }

            const endDrag = function(self) {
                return (e) => {
                    console.log(`Touch ended!`);
                    console.log(`State was still dragging.`);
                    self.setState({drag: false});
                    self.setTabScrollType('smooth');
                    const dragElement = document.getElementById(elementID);
                    dragElement.style.cursor = 'grab';
                    document.body.style.cursor = "default";
                    console.log(`Dragging has ended!`);
                    //self.moveToClosestOption();
                    if (mobile) {
                        document.body.removeEventListener('touchend', endDrag);
                        document.removeEventListener('touchmove', moveDragElement);
                    } else {
                        document.body.removeEventListener('mouseup', endDrag);
                        document.removeEventListener('mousemove', moveDragElement);
                    }
                }
            }(this);
            if (mobile) {
                console.log(`Adding event listener to end touch.`);
                document.body.addEventListener('touchend', endDrag);
            } else {
                document.body.addEventListener('mouseup', endDrag);
            }
        }
    }

    endDrag(e) {
        if (this.state.drag !== false) {
            this.setState({drag: false});
            const dragElement = e.currentTarget;
            dragElement.style.cursor = 'grab';
            console.log(`Dragging has ended!`);
        }
    }

    setTabScrollType(type) { //type is forced to either "smooth" or "auto"
        type = (type === 'smooth') ? 'smooth' : 'auto';
        const tabElement = document.getElementById('tab-scroll-target');
        tabElement.style.scrollBehavior = type;
    }

    setTabScroll(targetValue, percentage) {
        percentage = (percentage === undefined) ? true : percentage;
        const tabElement = document.getElementById('tab-scroll-target');
        const dragElement = document.getElementById(this.scrollHandleId);
        const parentElement = dragElement.parentElement;
        const offsetHeight = dragElement.offsetHeight;
        const scrollHeight = parentElement.offsetHeight;
        const maxScroll = scrollHeight - offsetHeight;
        console.log(`Setting tab scroll to ${targetValue} with maxScroll ${maxScroll} and percentage ${percentage}`);

        if (!percentage) {
            const newTargetValue = targetValue * 100 / maxScroll;
            targetValue = newTargetValue;
        }

        const maxConvertedScroll = tabElement.scrollHeight - tabElement.offsetHeight;
        const convertedScroll = targetValue * 0.01 * maxConvertedScroll;

        console.log(`targetValue="${targetValue}" maxConvertedScroll="${maxConvertedScroll}" convertedScroll="${convertedScroll}"`);

        tabElement.scrollTop = `${convertedScroll}`;
    }

    moveScroll(direction, mobile) {
        mobile = (mobile === undefined) ? false : mobile;
        if (!this.state.moving) {
            this.setState({
                moving: true,
            })
            const self = this;
            const slideHandleElement = document.getElementById(self.scrollHandleId);
    
            const endScroll = () => {
                console.log(`Ending scroll!`);
                clearInterval(int);
                if (!mobile) {
                    slideHandleElement.removeEventListener('mouseleave', endScroll);
                    document.removeEventListener('mouseup', endScroll);
                } else {
                    slideHandleElement.removeEventListener('touchleave', endScroll);
                    document.removeEventListener('touchend', endScroll);
                    document.removeEventListener('touchcancel', endScroll);
                }
                self.setState({
                    moving: false,
                })
            }

            if (!mobile) {
                slideHandleElement.addEventListener('mouseleave', endScroll);
                document.addEventListener('mouseup', endScroll);
                slideHandleElement.addEventListener('mouseleave', () => {
                    console.log(`Mouse left!`);
                });
                document.addEventListener('mouseup', () => {
                    console.log("Mouse raised.");
                })
            } else {
                slideHandleElement.addEventListener('touchleave', endScroll);
                document.addEventListener('touchend', endScroll);
                document.addEventListener('touchcancel', endScroll);
            }

            console.log(`Moving scroll ${direction} with mobile ${mobile}`);
            const offsetValue = 20;
            const offset = (direction === "up") ? -offsetValue : offsetValue;
            const checkInterval = 20;
            const initialTransformString = slideHandleElement.style.transform || `translate3d(0px, 0px, 0px)`;
            console.log(`InitialTransformString="${initialTransformString}"`);
            let [, initialX, initialY, initialZ] = this.translateRegEx.exec(initialTransformString);
            initialX = Number(initialX).toFixed(2);
            initialY = Number(initialY).toFixed(2);
            initialZ = Number(initialZ).toFixed(2);
            const parentElement = slideHandleElement.parentNode;
            const maxScroll = parentElement.offsetHeight - slideHandleElement.offsetHeight;
            let scrollTotal = 0;
            self.setTabScrollType('auto');
    
            const moveScroll = () => {
                const predictedNewY = Number(initialY) + Number(scrollTotal) + Number(offset);
                scrollTotal = (predictedNewY > maxScroll) ? maxScroll - initialY :
                    (predictedNewY < 0) ? -initialY : scrollTotal + offset;
                const actualNewY = (predictedNewY > maxScroll) ? maxScroll :
                    (predictedNewY < 0) ? 0 : predictedNewY;
                console.log(`InitialY="${initialY}" predictedNewY="${predictedNewY}" actualNewY="${actualNewY}" checkInterval="${checkInterval}"`);
                self.warpToLocation(actualNewY, checkInterval);
                self.recalculateShadowTilt(self.scrollHandleId,true);
                self.setTabScroll((actualNewY * 100 / maxScroll), true);
                if (offset > 0 && actualNewY === maxScroll) {
                    endScroll();
                } else if (offset < 0 && actualNewY === 0) {
                    endScroll();
                }
            }
    
            const int = setInterval(() => {
                moveScroll();
            }, checkInterval);
        }
    }

    render() {
        return <div className="scroll-control-wrapper">
            <div className="full-wrapper">
                <div className="scroll-control-line"></div>
                <div className="shadow-cover up-button"></div>
                <div className="shadow-cover down-button"></div>
                <div className="scroll-control-button up-button"></div>
                <div className="scroll-control-button-cover up-button"
                    onMouseDown={ (e) => {e.preventDefault();this.moveScroll('up')} }
                    onTouchStart={ (e) => {setTimeout(() => {e.preventDefault();this.moveScroll('up', true)},100)} }
                    onClick={ (e) => {e.preventDefault();} }
                    onMouseUp={ (e) => {e.preventDefault();} }
                    onTouchEnd={ (e) => {e.preventDefault();} }
                    onTouchCancel={ (e) => {e.preventDefault();} }>
                </div>
                <div className="scroll-control-button down-button"></div>
                <div className="scroll-control-button-cover down-button"
                    onMouseDown={ (e) => {e.preventDefault();this.moveScroll('down')} }
                    onTouchStart={ (e) => {setTimeout(() => {e.preventDefault();this.moveScroll('down', true)},100)} }
                    onClick={ (e) => {e.preventDefault();} }
                    onMouseUp={ (e) => {e.preventDefault();} }
                    onTouchEnd={ (e) => {e.preventDefault();} }
                    onTouchCancel={ (e) => {e.preventDefault();} }>
                </div>
            </div>
            <div className="full-wrapper">
                <div onMouseDown={ this.startDragDesktop } id={ this.scrollHandleId }
                    onTouchStart={ this.startDragMobile }
                    style={ {'transform': `translate3d(0px, 0px, 0px) rotate(45deg)`} }
                    className="vertical-slide-handle drag-control">
                        <div id={ `${this.scrollHandleId}-shadow` }
                            className="slide-handle-shadow-inner" style = { {'boxShadow': '8px -14px 7px 0px rgba(0, 0, 0, 0.4)'} }></div>
                    </div>
            </div>
        </div>
    }
}

export default ScrollControl;