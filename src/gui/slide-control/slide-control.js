import { thomsonCrossSectionDependencies } from 'mathjs';
import React from 'react';
import './slide-control.css';

const reduceString = (targetString) => {
    const stringArray = targetString.toLowerCase().split("").map(c => c === " " ? "-" : c);
    const reducedString = stringArray.join("");
    //const reducedArray = stringArray.map((c, i) => (i === 0 && stringArray[c-1] === " ") ? c.toUpperCase() : c).filter(c => c !== " ");
    //const reducedString = reducedArray.join("");
    return reducedString;
}


class SlideControl extends React.Component {
    constructor() {
        super();
        this.state = {
            drag: false,
            tabChoice: undefined,
        }
        this.startDragMobile = this.startDragMobile.bind(this);
        this.startDragDesktop = this.startDragDesktop.bind(this);
        this.moveSlideHandle = this.moveSlideHandle.bind(this);
        this.test = this.test.bind(this);

        this.translateRegEx = /translate3d\((-?[\d|.]+)px, (-?[\d|.]+)px, (-?[\d|.]+)px\)/;
        this.yTilt = {
            max: 10,
            min: 14,
        }
        this.xTilt = {
            max: 13,
            min: 8,
        }
        this.xLength = 20;
        this.yLength = 15;

        this.slideHandlesMoving = [];
        //console.log(`Finished constructing...`);
        this.optionList = [];
    }

    componentDidMount() {
        this.optionList = ['pageLeft',...this.props.optionList, 'pageRight'];
        this.setState({tabChoice: this.props.tabChoice});
        //console.log(`Checking initialChoice...`);
        const moveSlideHandle = function(self, optionNumber, duration) {
            return () => {
                self.moveToOption(optionNumber, duration);
                //console.log(`${self.props.id} is moved...`);
            }
        }(this, this.props.tabChoice, 500);
        setTimeout(moveSlideHandle, 700);

        const self = this;
        this.props.optionList.forEach((name) => {
            const element = document.getElementById(`top-bar-${name}`);
            element.addEventListener('click',
                function(targetName) {
                    return () => {
                        self.moveToOption(targetName);
                    }
                }(name)
            );
        })
    }

    parseDotmarkClick(clickName) {
        //console.log(`Parsing dotmark click with name "${clickName}"`);
        const protocols = {
            'moveDirection': (direction) => {
                //console.log(`this.state.tabChoice="${this.state.tabChoice}"`);
                const currentIndex = this.props.optionList.indexOf(this.state.tabChoice);
                const maxIndex = this.props.optionList.length - 1;
                let newIndex = (currentIndex + ((direction === 'right') ? 1 : -1));
                //console.log(`currentIndex="${currentIndex}" maxIndex="${maxIndex}" newIndex="${newIndex}"`);
                newIndex = (newIndex < 0) ? 0 : (newIndex > maxIndex) ?  maxIndex : newIndex;
                const newTabChoice = this.props.optionList[newIndex];
                //console.log(`newTabChoice="${newTabChoice}"`);
                this.moveToOption(newTabChoice);
            },
            'moveToOption': (option) => {
                //console.log(`option="${option}"`);
                this.moveToOption(option);
            }
        };

        const directionConverter = {
            'pageLeft': 'left',
            'pageRight': 'right',
        }

        const direction = directionConverter[clickName];

        const protocol = (direction === undefined) ? 'moveToOption' : 'moveDirection';
        //console.log(`protocol="${protocol}"`);
        protocols[protocol]((protocol === 'moveDirection') ? direction : clickName);
    } 

    getScrollPercent() {
        const scrollHandleElement = document.getElementById('main-side-scroll');
        const parentElement = scrollHandleElement.parentElement;
        const maxScroll = parentElement.offsetHeight - scrollHandleElement.offsetHeight;
        const transformString = scrollHandleElement.style.transform || `translate3d(0px, 0px, 0px)`;
        //console.log(`transformString="${transformString}"`);
        const [ ,initialX, initialY, initialZ] = this.translateRegEx.exec(transformString);
        //console.log(`initialY="${initialY}" scrollHandleElement.offsetTop="${scrollHandleElement.offsetTop}"`);
        const scroll = Number(initialY) + scrollHandleElement.offsetTop;
        //console.log(`scroll="${scroll}" maxScroll="${maxScroll}"`);
        const scrollPercent = Number(Number(scroll) * 100 / Number(maxScroll)).toFixed(2);
        //console.log(`scrollPercent="${scrollPercent}"`);
        return scrollPercent;
    }

    setScrollPercent(percentTarget) {
        //console.log(`Setting scroll percent to ${percentTarget}`);
        const tabViewerElement = document.getElementById(`tab-scroll-target`);
        //if (tabViewerElement === null) {return};
        const maxScroll = tabViewerElement.scrollHeight - tabViewerElement.offsetHeight;
        const targetScroll = Number(maxScroll) * percentTarget * 0.01;
        //console.log(`maxScroll="${maxScroll}" targetScroll="${targetScroll}"`);
        tabViewerElement.style.scrollBehavior = 'auto';
        tabViewerElement.scrollTop = targetScroll;
    }

    moveToOption(optionName, duration) {
        const self = this;
        const animationDistance = Math.abs(this.props.optionList.indexOf(this.state.tabChoice) - this.props.optionList.indexOf(optionName));
        const animationTime = (duration === undefined) ? 
            ((animationDistance > 0) ? Number(animationDistance) * 100 : 100) : 
            duration;
        //console.log(`Animation time is ${animationTime}`);
        //console.log(`Moving to ${optionName}`);
        const handleElement = document.getElementById(this.scrollHandleId);
        const handleRect = handleElement.getBoundingClientRect();
        const handleXY = handleRect[this.vertical ? 'top' : 'left'] + (handleElement[this.vertical ? 'offsetHeight' : 'offsetWidth'] * 0.5);
        const optionElement = document.getElementById(`${this.scrollHandleId}Hatchmark${optionName}`);
        const optionRect = optionElement.getBoundingClientRect();
        const optionXY = optionRect[this.vertical ? 'top' : 'left'] - 10 + (optionElement[this.vertical ? 'offsetHeight' : 'offsetWidth'] * 0.5);
        const xChange = (this.vertical) ? 0 : optionXY - handleXY;
        const yChange = (this.vertical) ? optionXY - handleXY : 0;
        //console.log(`Moving ${this.scrollHandleId} with xChange="${xChange}" yChange="${yChange}"`);
        this.moveSlideHandle(this.scrollHandleId, xChange, yChange, animationTime);
        this.setState({tabChoice: optionName});
        const scrollPercent = this.getScrollPercent();
        setTimeout(() => {
            self.setScrollPercent(scrollPercent);
        },  5);
        this.props.setTabChoice(optionName);
        const [protocol, host, pathname] = [window.location.protocol, window.location.host, window.location.pathname];
        const newURL = `${protocol}//${host}/${reduceString(optionName)}`;
        const obj = { Title: optionName, Url: newURL };
        window.history.pushState(obj, obj.Title, obj.Url);
        //window.location.assign(newURL);
        //console.log(`Tab Choice is now ${this.tabChoice}`);
    }

    moveToClosestOption() {
        //console.log(`Moving slide handle to closest option`);
        const options = this.props.optionList;
        const handleElement = document.getElementById(this.scrollHandleId);
        const handleRect = handleElement.getBoundingClientRect();
        const handleXY = handleRect[this.vertical ? 'top' : 'left'] + (handleElement[this.vertical ? 'offsetHeight' : 'offsetWidth'] * 0.5);
        let closestDistance = 10000;
        let closestOption = "";
        options.forEach((name) => {
            const optionElement = document.getElementById(`${this.scrollHandleId}Hatchmark${name}`);
            const optionRect = optionElement.getBoundingClientRect();
            const optionXY = optionRect[this.vertical ? 'top' : 'left'] + (optionElement[this.vertical ? 'offsetHeight' : 'offsetWidth'] * 0.5);
            const distance = Math.abs(handleXY - optionXY);
            if (distance < closestDistance) { 
                closestDistance = Number(distance);
                closestOption = String(name);
            }
        });
        //console.log(`Closest option is ${closestOption}`);
        this.moveToOption(closestOption);
        return closestOption;
    }

    interpolateArray(targetArray, numberOfPoints) {
        const targetArrayLength = targetArray.length;
        //console.log(`targetArrayLength="${targetArrayLength}" numberOfPoints="${numberOfPoints}"`);
        const newArray = [];
        const lengthConversion = Number(targetArrayLength - 1) / Number(numberOfPoints - 1);
        //console.log(`targetArrayLength="${targetArrayLength}" numberOfPoints="${numberOfPoints}" lengthConversion="${lengthConversion}"`);
        for (var i = 1; i <= Number(numberOfPoints); i++) {
            //console.log(`Interpolating point ${i}`);
            let newArrayValue = undefined;
            const convertedLength = Number(i - 1) * lengthConversion;
            const onPoint = (Math.abs(Number(convertedLength) - Math.round(convertedLength)) <= 0.01) ? true : false;
            //console.log(`convertedLength="${convertedLength}" onPoint="${onPoint}"`);
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
                //console.log(`point1Index="${point1Index}" point2Index="${point2Index}" point1="${point1}" point2="${point2}" simpleSlope="${simpleSlope}" fractionalProjectedPoint="${fractionalProjectedPoint}"`);
                //console.log(`simpleProjectedPoint="${simpleProjectedPoint}" flexibilityFactor="${flexibilityFactor}" stiffnessFactor="${stiffnessFactor}" projectedAdjacentPoint1="${projectedAdjacentPoint1}" projectedAdjacentPoint2="${projectedAdjacentPoint2}"`);
                //console.log(`adjacentPoint1="${adjacentPoint1}" adjacentPoint2="${adjacentPoint2}" adjacentPoint1Adjustment="${adjacentPoint1Adjustment}" adjacentPoint2Adjustment="${adjacentPoint2Adjustment}" finalProjectedPoint="${finalProjectedPoint}"`);
                newArrayValue = finalProjectedPoint;
            }
            if (newArrayValue !== undefined) {
                //console.log(`Pushing value ${newArrayValue} to array...`);
                newArray.push(newArrayValue.toFixed(2));
            }
        }
        //console.log(`Interpolated array is ${JSON.stringify(newArray)}`);
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
        if (xChange == 0 && yChange == 0) {
            return;
        }
        time = (time === undefined) ? 300 : time;
        minSpeed = (minSpeed === undefined) ? 3 : minSpeed;
        const xDirection = (xChange == 0) ? 1 : (xChange) / Math.abs(xChange);
        const yDirection = (yChange == 0) ? 1 : (yChange) / Math.abs(yChange);
        //console.log(`XDirection ${xDirection} and yDirection ${yDirection}`);
        if (this.slideHandlesMoving.indexOf(handleID) === -1) {
            this.slideHandlesMoving = this.slideHandlesMoving.concat([handleID]);
        }
        const timestep = 10;
        const steps = Math.ceil(time / timestep) + 1;
        const slideHandleElement = document.getElementById(handleID);
        const initialTransformString = slideHandleElement.style.transform || `translate3d(0px, 0px, 0px)`;
        const initialTransformArray = initialTransformString.split(') ').filter(name => {
            return name.substring(0, String('translate3d').length) !== 'translate3d';
        });
        let transformSuffix = '';
        initialTransformArray.forEach((name, index) => {
            //console.log(`Posting ${name} to transform`);
            transformSuffix += `${name}`;
            if (name[name.length - 1] !== ")") {
                transformSuffix += ")";
            }
            transformSuffix += " ";
        })
        //console.log(`InitialTransformString="${initialTransformString}"`);
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
        //console.log(`Animation Weight Array is ${JSON.stringify(animationWeightArray)}`);
        const xMovementHistory = [];
        let lastNewX = initialX; let lastNewY = initialY;
        let xCompleted = false, yCompleted = false;
        const intervalFunction = function(self) {
            return () => {
                step++;
                //console.log(`Moving step ${step}`);
                if (step > 100) {
                    clearInterval(int);
                    return;
                }
                //console.log(`InitialX="${Number(initialX)}" step="${step}" steps="${steps}" step/steps="${Number(step / steps)}" xChange="${Number(xChange)}"`);
                //console.log(`step/steps * xChange="${Number(Number(step / steps) * Number(xChange))}" initialX+(step/steps)*xChange="${Number(initialX) + Number(Number(step / steps) * Number(xChange))}" convertedToNumber="${Number(Number(initialX) + Number(Number(step / steps) * Number(xChange)))}" toFixed="${Number(Number(initialX) + Number(Number(step / steps) * Number(xChange))).toFixed(2)}"`);
                const xDiff = Number(Number(1 / steps) * Number(xChange) * (animationWeightArray[step - 1] || 1)).toFixed(2);
                const yDiff = Number(Number(1 / steps) * Number(yChange) * (animationWeightArray[step - 1] || 1)).toFixed(2);
                //console.log(`initialX="${initialX}" lastNewX="${lastNewX}" xDiff="${xDiff}"`);
                let newX = Number(Number(lastNewX) + Number(xDiff)).toFixed(2);
                let newY = Number(Number(lastNewY) + Number(yDiff)).toFixed(2);
                //console.log(`newX="${newX}" newY="${newY}"`);
                //console.log(`Comparing newX="${newX}" with maxX="${Number(initialX) + Number(xChange)}"`);
                if (!xCompleted) {
                    //console.log(`xDirection="${xDirection}" newX="${newX}" initialX="${initialX}" xChange="${xChange}"`);
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
                const newTransform = `translate3d(${newX}px, ${newY}px, ${initialZ}px)`;
                xMovementHistory.push(newX);
                slideHandleElement.style.transform = String(newTransform) + String(transformSuffix);
                self.recalculateShadowTilt(handleID, false);
                //console.log(`After move xCompleted="${xCompleted}" yCompleted="${yCompleted}"`);
                lastNewX = Number(newX);
                lastNewY = Number(newY);
                if (xCompleted && yCompleted) {
                    //xMovementHistory.forEach((x, i) => console.log(`${i}: ${x}, weight: ${animationWeightArray[i]}`));
                    clearInterval(int);
                }
            }
        }(this);
        const int = setInterval(intervalFunction, timestep);
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
            //console.log(`AssemblingBoxShadow with acc="${acc}"`);
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
        //console.log(`TranslateArray="${JSON.stringify(translateArray)}`)
        const initialXYOffset = Number(translateArray[(vertical) ? 2 : 1]) + slideHandleElement[(vertical) ? 'offsetTop' : 'offsetLeft'];
        const offsetString = `offset${(vertical) ? 'Height' : 'Width'}`;
        const maxXY = parentElement[offsetString] - slideHandleElement[offsetString];
        const percentage = Math.floor(((initialXYOffset * 1.0) / (maxXY * 1.0)) * 100) * 0.01;
        const tiltRange = this[`${(vertical) ? 'y' : 'x'}Tilt`].max - this[`${(vertical) ? 'y' : 'x'}Tilt`].min;
        const tiltValue = (percentage * tiltRange) + this[`${(vertical) ? 'y' : 'x'}Tilt`].min;
        const altTiltRange = this[`${(vertical) ? 'x' : 'y'}Tilt`].max - this[`${(vertical) ? 'x' : 'y'}Tilt`].min;
        const altTiltValue = (percentage * altTiltRange) + this[`${(vertical) ? 'x' : 'y'}Tilt`].min;

        const oldShadowObject = this.disassembleBoxShadow(shadowElement.style.boxShadow);
        oldShadowObject[vertical ? 'vOffset' : 'hOffset'] = `${Number((tiltValue * 100) * 0.01).toFixed(2)}px`;
        if (both) {
            oldShadowObject[vertical ? 'hOffset' : 'vOffset'] = `${Number(Math.floor(altTiltValue * 100) * 0.01).toFixed(2)}px`;
        }
        //console.log(`Both is ${both} and oldShadowObject is ${JSON.stringify(oldShadowObject)}`);
        const newShadow = this.assembleBoxShadow(oldShadowObject);
        //const newShadow = `${(!vertical) ? tiltValue : 20}px ${(vertical) ? tiltValue : 20}px 7px 0px rgba(0, 0, 0, 0.5)`;
        shadowElement.style.boxShadow = newShadow;
    }

    startDragMobile(e) {
        this.startDrag(e, this.scrollHandleID, this.vertical, true);
    }

    startDragDesktop(e) {
        this.startDrag(e, this.scrollHandleID, this.vertical, false);
    }

    startDrag(e, elementID, vertical, mobile) { //Convert to general form for both vertical and horizontal scrolling and any scrollHandleID
        mobile = (mobile === undefined) ? false : mobile;
        vertical = (vertical === undefined) ? this.vertical : vertical;
        elementID = (elementID === undefined) ? this.scrollHandleId : elementID;
        //console.log(`ElementID is ${elementID}`);
        if (this.state.drag !== true) {
            if (!mobile) {
                e.preventDefault();
            }
            this.setState({drag: true});
            //console.log(`Dragging has begun!`)
            //console.log(`CurrentTarget elementID is ${elementID}`);
            const currentTarget = (mobile) ? e.targetTouches.item(0) : e.currentTarget;
            const screenTarget = (mobile) ? currentTarget : e;
            const xy = screenTarget[(vertical) ? 'screenY' : 'screenX'];
            const dragElement = document.getElementById(elementID);
            dragElement.style.cursor = 'inherit';
            document.body.style.cursor = "grabbing";
            const initialTranslate = dragElement.style.transform || 'translate3d(0px, 0px, 0px)';
            //console.log(`InitialTranslate is ${initialTranslate}`);
            const translateArray = this.translateRegEx.exec(initialTranslate);
            const initialTransformArray = initialTranslate.split(') ').filter(name => {
                return name.substring(0, String('translate3d').length) !== 'translate3d';
            });
            const initialXYOffset = Number(translateArray[(vertical) ? 2 : 1]) + dragElement[(vertical) ? 'offsetTop' : 'offsetLeft'];
            const parentElement = dragElement.parentNode;
            const offsetType = (vertical) ? 'offsetHeight' : 'offsetWidth';
            const maxXY = parentElement[offsetType] - dragElement[offsetType];
            let moveDragElement = function(xy, maxXY, self) {
                return e2 => {
                    const currentTarget2 = (mobile) ? e2.changedTouches.item(0) : e2.currentTarget;
                    const screenTarget2 = (mobile) ? currentTarget2 : e2;
                    const xy2 = screenTarget2[(vertical) ? 'screenY' : 'screenX'];
                    //console.log(`IntialOffset: ${initialXYOffset} | xy2: ${xy2} | xy: ${xy}`);   
                    let xyOffset = initialXYOffset + xy2 - xy;
                    xyOffset = Math.floor(xyOffset * 100) * 0.01;
                    //console.log(`xyOffset is first ${xyOffset}`);
                    xyOffset = (xyOffset < 0) ? 0 :
                        (xyOffset > maxXY) ? maxXY : xyOffset;
                    //console.log(`then ${xyOffset}`);
                    let newTransform = `translate3d(${(!vertical) ? xyOffset : 0}px, ${(vertical) ? xyOffset : 0}px, 0px)`;
                    initialTransformArray.forEach((name, index) => {
                        //console.log(`Posting ${name} to transform`);
                        newTransform += `${name}`;
                        if (name[name.length - 1] !== ")") {
                            newTransform += ")";
                        }
                        newTransform += " ";
                    })
                    //console.log(`New transform is ${newTransform}`);
                    dragElement.style.transform = newTransform;
                    self.recalculateShadowTilt(elementID, vertical);
                }
            }(xy, maxXY, this);
            if (mobile) {
                document.addEventListener('touchmove', moveDragElement);
            } else {
                document.addEventListener('mousemove', moveDragElement);
            }

            const endDrag = function(self) {
                return (e) => {
                    //console.log(`Touch ended!`);
                    //console.log(`State was still dragging.`);
                    self.setState({drag: false});
                    const dragElement = document.getElementById(elementID);
                    dragElement.style.cursor = 'grab';
                    document.body.style.cursor = "default";
                    //console.log(`Dragging has ended!`);
                    self.moveToClosestOption();
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
                //console.log(`Adding event listener to end touch.`);
                document.body.addEventListener('touchend', endDrag);
            } else {
                document.body.addEventListener('mouseup', endDrag);
            }
        }
    }

    test() {
        //console.log(`TESTING...`);
    }

    render() {
        this.vertical = (this.props.vertical === undefined) ? false : this.props.vertical;
        this.scrollHandleId = `${this.props.id}-handle`;
        return <div className="slide-wrapper">
            <div className="slide-dotmark-shadows-wrapper">
                { this.optionList.map(name => <div className="slide-dotmark-shadow" key={ name + 'DotmarkShadow' }>
                    
                </div>) }
            </div>
            <div className="slide-line-wrapper">
                <div className="slide-line"></div>
            </div>
            <div className="slide-dotmark-wrapper">
                { this.optionList.map(name => <div className="slide-dotmark" 
                    onClick={ () => {this.parseDotmarkClick(name)} } key={ name + 'Dotmark' }>
                </div>) }
            </div>
            <div className="slide-hatchmark-wrapper">
                { this.optionList.map(name => <div style={ {'opacity': (name === 'pageLeft' || name === 'pageRight') ? '0' : '1'}} className={ `slide-hatchmark${(this.state.tabChoice === name) ? ' glowing-box':''}` } id={ `${this.scrollHandleId}Hatchmark${name}` } key={ `${name}Hatchmark` }>
                    <div className="hatchmark-title">
                        <div className={ `${(this.state.tabChoice === name) ? 'glowing-text':''}` } onMouseDown={ (e) => e.preventDefault() } onClick={ (e) => {e.preventDefault();this.moveToOption(name)} }>{ name }</div>
                    </div>
                </div>) }
            </div>
            <div className="slide-box">
                <div className="slide-handle" id={ this.scrollHandleId }
                    onMouseDown={ this.startDragDesktop } onTouchStart={ this.startDragMobile }
                    style={ {'transform': `rotate(45deg) translate3d(0px, 0px, 0px)`} }>
                    <div id={ `${this.scrollHandleId }-shadow` }
                        className="slide-handle-shadow-inner" style = { {'boxShadow': '8px 14px 7px 0px rgba(0, 0, 0, 0.4)'} }></div>
                </div>
            </div>
        </div>
    }
}

export default SlideControl;