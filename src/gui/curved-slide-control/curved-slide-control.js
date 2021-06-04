import React from 'react';
import './curved-slide-control.css';

class CurvedSlideComponent extends React.Component {
    getInitialState() {
        return {
            dragging: false,
            location: 0,
        }
    }

    componentDidMount() {
        this.setState({
            dragging: false,
            location: 0,
            ringType: this.props.ringType,
            top: (this.props.top === undefined) ? true : this.props.top,
            title: (this.props.title === undefined) ? '(none)' : this.props.title,
        })

        this.ringId = `${this.props.id}-slide-control`;

        this.calculateSlopeToCenter = this.calculateSlopeToCenter.bind(this);
        this.test = this.test.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.warpSlideHandle = this.warpSlideHandle.bind(this);
        this.moveSlideHandle = this.moveSlideHandle.bind(this);
        this.moveToClosestOption = this.moveToClosestOption.bind(this);
        this.moveToOption = this.moveToOption.bind(this);

        this.lastXY = {x: 0, y: 0,};
        this.lastAngle = {slope: 0, radians: 0, degrees: 0,};
        this.translateRegEx = /translate3d\((-?[\d|.]+)px, (-?[\d|.]+)px, (-?[\d|.]+)px\)/;
        const themeNumber = this.props.optionList.indexOf(this.props.choice);
        console.log(`props.choice="${this.props.choice}" themeNumber="${themeNumber}"`);
        const moveSlideHandle = function(self, optionNumber, duration) {
            return () => {
                self.moveToOption(optionNumber, duration);
                //console.log(`${self.props.id} is moved...`);
            }
        }(this, themeNumber, 500);
        setTimeout(moveSlideHandle, 700);

        if (this.props.initialChoice !== undefined) {
        }
    }

    findCenterOfSlider() {
        if (this.centerXY === undefined) {
            const sliderControlElement = document.getElementById(this.ringId);
            const sliderControlBox = sliderControlElement.getBoundingClientRect();
            const windowX = window.pageXOffset != 'undefined' ? window.pageXOffset :document.documentElement && document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft ? document.body.scrollLeft : 0;
            const windowY = window.pageYOffset != 'undefined' ? window.pageYOffset :document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ? document.body.scrollTop : 0;
            const centerX = Number(windowX + sliderControlBox.left + (sliderControlElement.offsetWidth * 0.5)).toFixed(2);
            const centerY = Number(windowY + sliderControlBox.top + (sliderControlElement.offsetHeight * 0.5)).toFixed(2);
            console.log(`windowX="${windowX}" sliderControlBox.left="${sliderControlBox.left}" sliderControlElement.offsetWidth="${sliderControlElement.offsetWidth}"`);
            console.log(`windowY="${windowY}" sliderControlBox.top="${sliderControlBox.top}" sliderControlElement.offsetHeight="${sliderControlElement.offsetHeight}"`);
            this.centerXY = {
                x: centerX,
                y: centerY,
            };
        }
        //console.log(`CenterX="${this.centerXY.x}" CenterY="${this.centerXY.y}"`);
        return this.centerXY;
    }

    test(e) {
        this.calculateSlopeToCenter(e.screenX, e.screenY);
    }

    checkMinMax(desiredAngle) {
        const desiredAngleSign = desiredAngle / Math.abs(desiredAngle);
        const bottom = (this.props.top !== true) ? true : false;
        const halfRing = (this.props.ringType === 'half') ? true : false;
        desiredAngle = desiredAngle * 180 / Math.PI;
        console.log(`Initial desired angle is ${desiredAngle}`);
        if (this.props.top !== true) {
            desiredAngle = (Number(desiredAngle) === 0) ? 0 : (180 * desiredAngle / Math.abs(desiredAngle)) - desiredAngle;
        }
        const absoluteAngle = Math.abs(desiredAngle);
        console.log(`Desired angle is ${desiredAngle}`);
        let validAngle = undefined;
        let upper, lower;
        if (halfRing) {
            [upper, lower] = [90, 0];
        } else {
            [upper, lower] = [45, 0];
        }
        console.log(`Upper is ${upper} and lower is ${lower}`);
        const upperDiff = upper - absoluteAngle;
        const lowerDiff = absoluteAngle - lower;
        console.log(`UpperDiff="${upperDiff}" lowerDiff="${lowerDiff}"`);
        const valid = (lowerDiff >= 0 && upperDiff >= 0) ? true : false;
        if (!valid) {
            console.log(`Upper is lower ${(Math.abs(upperDiff) < Math.abs(lowerDiff)) ? true : false}`);
            validAngle = (Math.abs(upperDiff) < Math.abs(lowerDiff)) ? upper : lower;
            validAngle *= desiredAngleSign;
        } else {
            validAngle = desiredAngle;
        }
        console.log(`Final valid angle is ${validAngle}`);
        validAngle = validAngle * Math.PI / 180;
        console.log(`Valid angle in radians is ${validAngle}`);
        return validAngle;
    }

    calculateSlopeToCenter(x, y) {
        const centerXY = this.findCenterOfSlider();
        const mouseXY = {
            x: x,
            y: y,
        }
        //console.log(`MouseX="${mouseXY.x}" MouseY="${mouseXY.y}" centerX="${centerXY.x}" centerY="${centerXY.y}"`);
        const xDiff = mouseXY.x - centerXY.x;
        const yDiff = mouseXY.y - centerXY.y;
        console.log(`XDiff="${xDiff}" yDiff="${yDiff}"`);
        const slope = Number(xDiff / yDiff).toFixed(2);
        const xIsPositive = Number(xDiff) > 0 ? true : false;
        const yIsPositive = Number(yDiff) > 0 ? true : false;
        const xAbs = Math.abs(xDiff);
        const yAbs = Math.abs(yDiff);
        const absoluteAngle = Math.atan(xAbs / yAbs);
        const protocols = {
            'xposyneg': () => {
                return absoluteAngle;
            },
            'xnegyneg': () => {
                return -absoluteAngle;
            },
            'xnegypos': () => {
                 return -Math.PI + absoluteAngle;
            },
            'xposypos': () => {
                return Math.PI - absoluteAngle;
            },
        }
        const protocol = (xIsPositive) ? ((yIsPositive) ? 'xposypos' : 'xposyneg') : ((yIsPositive) ? 'xnegypos' : 'xnegyneg');
        console.log(`Protocol="${protocol}"`);
        const angleInRadians = protocols[protocol](); //Math.atan(slope);
        const angleInDegrees = Number(angleInRadians * 180 / Math.PI).toFixed(2);
        console.log(`angleInRadians="${angleInRadians}" angleInDegrees="${angleInDegrees}"`);
        const angleObject = {
            slope: slope,
            radians: angleInRadians,
            degrees: angleInDegrees,
        };
        return angleObject;
    }

    calculateXYFromAngle(angleInRadians) {
        const normalizedRise = Math.sin(angleInRadians);
        const normalizedRun = Math.cos(angleInRadians);
        const widthOfCircle = Number(getComputedStyle(document.documentElement).getPropertyValue('--slider-width').split("px")[0]) - 6; //must match the pixel value give in the css
        const radius = widthOfCircle * 0.5;
        const y = Number(Number(normalizedRun) * Number(radius)).toFixed(2);
        const x = -Number(Number(normalizedRise) * Number(radius)).toFixed(2);
        return {
            x: x,
            y: y,
        };
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

    moveToClosestOption() {
        const currentAngle = this.lastAngle.radians;
        const optionAngles = ((this.props.ringType === 'half') ? [-90, -30, 30, 90] : [-45, 45]).map(number => number * Math.PI / 180);
        console.log(`Option Angles are ${JSON.stringify(optionAngles)}`);
        const angleDifferences = optionAngles.map(number => Math.abs(currentAngle - number));
        console.log(`Angle differences are ${JSON.stringify(angleDifferences)}`);
        let bestAngle = undefined, bestOption = undefined;
        angleDifferences.forEach((diff, index) => {
            const newBest = (bestAngle === undefined || bestAngle > diff) ? true : false;
            bestAngle = newBest ? diff : bestAngle;
            bestOption = newBest ? index : bestOption;
        })
        console.log(`Closest option is ${bestOption} or ${this.props.optionList[bestOption]}`);
        this.moveToOption(bestOption);
    }

    moveToOption(optionIndex, duration) {
        console.log(`Moving to option ${optionIndex}`);
        const optionAngles = ((this.props.ringType === 'half') ? [-90, -30, 30, 90] : [-45, 45]).map(number => number * Math.PI / 180);
        console.log(`Moving to OptionIndex="${optionIndex}"`);
        console.log(`OptionAngles="${JSON.stringify(optionAngles)}" TargetAngle="${optionAngles[optionIndex]}"`);
        const targetAngle = optionAngles[optionIndex];
        console.log(`Moving to targetAngle="${targetAngle}"`);
        this.moveSlideHandle(targetAngle, duration, true);
        const broadcastUpdate = function(self, option) {
            return () => {
                self.props.setChoice(option);
            }
        }(this, this.props.optionList[optionIndex]);
        setTimeout(broadcastUpdate, duration);
    }

    moveSlideHandle(newAngle, duration, checkedMinMax) {
        console.log(`Moving slide handle...`);
        console.log(`newAngle="${newAngle}" duration="${duration}" checkedMinMax="${checkedMinMax}"`);
        if (this.state.dragging === false) {
            this.setState({dragging: true});
            duration = (duration === undefined) ? 200 : duration;
            checkedMinMax = (checkedMinMax === undefined) ? false : checkedMinMax;
            console.log(`CheckedMinMax="${checkedMinMax}"`);
            let currentAngle = this.checkMinMax(this.lastAngle.radians);
            newAngle = (!checkedMinMax) ? this.checkMinMax(newAngle) : newAngle;
            console.log(`currentAngle="${currentAngle}" newAngle="${newAngle}"`);
            const angleDirection = Number(newAngle - currentAngle) / Math.abs(Number(newAngle - currentAngle));
            const timestep = 10;
            const steps = Math.ceil(duration / timestep) + 1;
            let step = 0;
            const animationWeightArrays = {
                'ease-in-out': [1, 1.05, 1.1, 1.2, 1.3, 1.35, 1.3, 1.2, 1.1, 1.05, 1],
            };
            const animation = 'ease-in-out';
            let animationWeightArray = animationWeightArrays[animation];
            animationWeightArray = this.normalizeArray(this.interpolateArray(animationWeightArray, steps));
            let angleCompleted = false, targetAngle = currentAngle;
            const intervalFunction = function(self, finalAngle) {
                console.log(`IntervalFunction initialization NewAngle="${finalAngle}"`)
                return () => {
                    step++;
                    console.log(`Moving step ${step}`);
                    if (step > 100) {
                        clearInterval(int);
                        return;
                    }
                    console.log(`finalAngle="${finalAngle}" currentAngle="${currentAngle}" steps="${steps}" animationMultiplier="${animationWeightArray[step - 1]}"`);
                    targetAngle += (finalAngle - currentAngle) * (1 / steps) * animationWeightArray[step - 1];
                    console.log(`TargetAngle="${targetAngle}"`);
                    if (!angleCompleted) {
                        angleCompleted = ((Number(angleDirection) * targetAngle) >= (Number(angleDirection) * (Number(newAngle)))) ? true : false;
                        if (angleCompleted) {
                            targetAngle = Number(finalAngle).toFixed(2);
                        }
                    }
                    self.warpSlideHandle(targetAngle, true);
                    if (angleCompleted || step === steps) {
                        clearInterval(int);
                        self.setState({dragging: false});
                    }
                }
            }(this, newAngle);
            const int = setInterval(intervalFunction, timestep);
        }
    }

    warpSlideHandle(newAngle, minMaxChecked) {
        minMaxChecked = (minMaxChecked === undefined) ? false : minMaxChecked;
        //console.log(`minMaxChecked="${minMaxChecked}" initial newAngle="${newAngle}"`)
        if (!minMaxChecked) {
            newAngle = this.checkMinMax(newAngle);
        }
        //console.log(`Checking XY for newAngle="${newAngle}"`);
        const newXY = this.calculateXYFromAngle(newAngle);
        const baseXY = this.calculateXYFromAngle(0);
        //console.log(`newXY="${JSON.stringify(newXY)} baseXY="${JSON.stringify(baseXY)}"`);
        const offsetX = -Number(Number(newXY.x) - Number(baseXY.x)).toFixed(2);
        const offsetY = -Number(Number(newXY.y) - Number(baseXY.y)).toFixed(2);
        const slideHandleElement = document.getElementById(`${this.ringId}-slide-handle`);
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
        //console.log(`Applying transform="${`translate3d(${offsetX}px, ${offsetY}px, 0px)`}" to ${`${this.ringId}-slide-handle`}`);
        this.lastAngle = {
            radians: newAngle,
            degrees: newAngle * Math.PI / 180,
        }
        let newTransform = `translate3d(${offsetX}px, ${offsetY}px, ${initialZ}px)`;
        initialTransformArray.forEach((name, index) => {
            console.log(`Posting ${name} to transform`);
            newTransform += `${name}`;
            if (name[name.length - 1] !== ")") {
                newTransform += ")";
            }
            newTransform += " ";
        })
        slideHandleElement.style.transform = newTransform;
    }

    startDrag(e, mobile) {
        mobile = (mobile === undefined) ? false : mobile;
        //Check drag then use angle formed with center to manipulate the element itself
        if (this.state.dragging !== true) {
            const self = this;
            const checkAngleChange = (e) => {
                const currentTarget = (mobile) ? e.targetTouches.item(0) : e.currentTarget;
                const screenTarget = (mobile) ? currentTarget : e;
                let newAngleObject = undefined;
                let [clientX, clientY] = [screenTarget.clientX, screenTarget.clientY];
                //console.log(`Mouse clientX="${clientX}" clientY="${clientY}"`);
                if (self.props.top === true) {
                    clientX = clientX - 40;
                    clientY = clientY - 20;
                }
                newAngleObject = self.calculateSlopeToCenter(clientX, clientY,);
                const angleDiffObject = {
                    slope: (self.lastAngle.slope !== undefined) ? newAngleObject.slope - self.lastAngle.slope : 0,
                    radians: (self.lastAngle.radians !== undefined) ? newAngleObject.radians - self.lastAngle.radians : 0,
                    degrees: (self.lastAngle.degrees !== undefined) ? newAngleObject.degrees - self.lastAngle.degrees : 0,
                }
                return [newAngleObject, angleDiffObject];
            }

            const moveSlideHandle = (angleDiffObject) => {
                //This can work but I need to change the original position of the slide handle when it loads on the page
                let newAngle = self.lastAngle.radians + angleDiffObject.radians;
                //console.log(`LastAngle="${self.lastAngle.radians} DiffAngle="${angleDiffObject.radians}" newAngle="${newAngle}"`);
                self.warpSlideHandle(newAngle);
            }

            const setLastAngle = (newAngleObject) => {
                self.lastAngle = newAngleObject;
            }

            const updateAngle = (e) => {
                const [newAngleObject, angleDiffObject] = checkAngleChange(e);
                moveSlideHandle(angleDiffObject);
                setLastAngle(newAngleObject);
            }
            
            const currentTarget = (mobile) ? e.targetTouches.item(0) : e.currentTarget;
            const screenTarget = (mobile) ? currentTarget : e;
            this.setState({dragging: true});
            document.body.style.cursor = "grabbing";
            const [clientX, clientY] = [screenTarget.clientX, screenTarget.clientY];
            //console.log(`clientX="${clientX}" clientY="${clientY}"`);

            setLastAngle(self.calculateSlopeToCenter(clientX, clientY));

            if (mobile) {
                document.addEventListener('touchmove', updateAngle);
            } else {
                document.addEventListener('mousemove', updateAngle);
            }

            const endDrag = function(self) {
                return (e) => {
                    //console.log(`Touch ended!`);
                    //console.log(`State was still dragging.`);
                    self.setState({dragging: false});
                    //console.log(`Looking for element with id="${`${self.ringId}-slide-handle`}`);
                    self.moveToClosestOption();
                    const dragElement = document.getElementById(`${self.ringId}-slide-handle`);
                    dragElement.style.cursor = 'grab';
                    document.body.style.cursor = "default";
                    //console.log(`Dragging has ended!`);
                    //self.moveToClosestOption();
                    if (mobile) {
                        document.body.removeEventListener('touchend', endDrag);
                        document.removeEventListener('touchmove', updateAngle);
                    } else {
                        document.body.removeEventListener('mouseup', endDrag);
                        document.removeEventListener('mousemove', updateAngle);
                    }
                }
            }(self);
            if (mobile) {
                //console.log(`Adding event listener to end touch.`);
                document.body.addEventListener('touchend', endDrag);
            } else {
                document.body.addEventListener('mouseup', endDrag);
            }
        }
    }

    render() {
        const ringClass = this.props.ringType === 'half' ? 'half-ring' : 'quarter-ring';
        const ringLayerClass = this.props.ringType === 'half' ? 'half-ring-layer' : 'quarter-ring-layer';
        const slideClass = this.props.ringType === 'half' ? 'half-ring-slide-handle' : 'quarter-ring-slide-handle';
        const bottomClass = this.props.top === false ? ' bottom-ring' : '';
        const shadowTypeClass = `shadow-type-${ringClass}`;
        const ringWrapperClass = this.props.top === true ? 'title-wrapper' : 'bottom-title-wrapper';
        const state = (this.state === undefined || this.state === null) ? this.getInitialState() : this.state;
        const dragging = (state.dragging === true) ? true : false;
        const textClass = (this.props.ringType === 'half' ? 'half-ring-text' : 'quarter-ring-text')
            + (this.props.top === false ? ' bottom-text' : ' top-text');
        const dotStyles =[
            {
                'transform': 'rotate(-135deg) !important'
            },{
                'transform': 'rotate(-45deg) !important'
            },{
                'transform': 'rotate(-45deg) !important'
            },{
                'transform': 'rotate(-45deg) !important'
            }
        ];

        const indicatorShadows = {
            'half': [
                '3px -1.5px 2px 0px rgba(0, 0, 0, 0.5)',
                '1.5px 3px 2px 0px rgba(0, 0, 0, 0.5)',
                '-1.5px 3px 2px 0px rgba(0, 0, 0, 0.5)',
                '-3px 1.5px 2px 0px rgba(0, 0, 0, 0.5)',
            ],
            'quarter': [
                '-3px -3px 2px 0px rgba(0, 0, 0, 0.5)',
                '3px -3px 2px 0px rgba(0, 0, 0, 0.5)',
            ]
        }

        const shadowRotations = {
            'half-ring': [-135, -45, -45, 45], 
            'quarter-ring': [135, 135],
        }

        const themeHueRotations = [140, 83, -71, 0 ];

        //console.log(`ringClass="${ringClass}" slideClass="${slideClass}"`);

        return <div className="curved-slide-control-wrapper">
            <div className={ `curved-slide-control-sub-wrapper${bottomClass}` }>
                <div className={ `outer-ring ${ringClass}` } id={ this.ringId }>
                    <div className={ `inner-ring ${ringClass}` }>
                        <div className="ring-dot-wrapper">
                            <div className="ring-dot-sub-wrapper">
                                { (this.props.ringType === 'half' ? [-90.5, -30.5, 29.5, 89.5] : [-45.5, 44.5]).map((rotation, index) => 
                                <div key={ rotation } className="single-shadow-wrapper" 
                                    style={ {'transform': `rotate(${-rotation}deg)`} }>
                                    <div className="single-shadow-sub-wrapper" 
                                        style={ {'transform': `rotate(-90deg)`} }>
                                        <div className={`shadow-dot ${shadowTypeClass}-${index}`} 
                                            style={ {'transform': `rotate(${shadowRotations[ringClass][index]}deg)`} }></div>
                                    </div>
                                </div>) }
                            </div>
                        </div>
                        <div style={ {display: (this.props.ringType === 'quarter') ? 'block' : 'none'} } 
                            className={ `${ringClass}-gap-fill-0` }></div>
                        <div style={ {display: (this.props.ringType === 'quarter') ? 'block' : 'none'} } 
                            className={ `${ringClass}-gap-fill-1` }></div>
                        <div className={ `ring-layer ${ringLayerClass}` }>
                            <div className="ring-layer-shadow">
                                <div className="ring-layer-inner-shadow"></div>
                            </div>
                        </div>
                        <div style={ {display: (this.props.ringType === 'half') ? 'block' : 'none'} } className={ `${ringClass}-gap-fill` }></div>
                        <div className="ring-dot-wrapper">
                            <div className="ring-dot-sub-wrapper ">
                                { (this.props.ringType === 'half' ? [-90, -30, 30, 90] : [-45, 45]).map((rotation, index) => 
                                <div key={ rotation } className="single-dot-wrapper" 
                                    style={ {'transform': `rotate(${-rotation}deg)`} }>
                                    <div className="single-dot-sub-wrapper">
                                        <div className={ `new-ring-dot-indicator ${this.props.optionList.indexOf(this.props.choice) === 3 - index ? 
                                            'selected-ring-dot-indicator' : ''}` } 
                                            style={ {filter: `hue-rotate(${themeHueRotations[index]}deg)`, 
                                                    display: (this.props.ringType === 'half') ? 'block' : 'none', 
                                                    boxShadow: `${indicatorShadows[this.props.ringType][index]}` } }
                                            onClick={ () => {this.moveToOption((this.props.ringType === 'half') ? 3 - index : 1 - index)} }
                                            /* onTouchStart={ () => {this.moveToOption((this.props.true === true) ? 3 - index : 1 - index)} } */>
                                        </div>
                                        <div className={ `${index === 0 ? 'light' : 'dark'}-indicator new-ring-dot-indicator
                                            ${this.props.optionList.indexOf(this.props.choice) === 1 - index ? 
                                            `selected-ring-dot-indicator selected-${index === 0 ? 'light' : 'dark'}` : ''}` } 
                                            style={ {display: (this.props.ringType === 'quarter') ? 'block' : 'none',
                                                    backgroundColor: `var(--mode-icon-${(index === 0) ? 'light' : 'dark'}-color)`, 
                                                    boxShadow: `${indicatorShadows[this.props.ringType][index]}` } }
                                            onClick={ () => {this.moveToOption((this.props.ringType === 'half') ? 3 - index : 1 - index)} }
                                            /* onTouchStart={ () => {this.moveToOption((this.props.true === true) ? 3 - index : 1 - index)} } */>
                                        </div>
                                    </div>
                                </div>) }
                            </div>
                        </div>
                        <div className="ring-dot-wrapper">
                            <div className="ring-dot-sub-wrapper ">
                                { (this.props.ringType === 'half' ? [-90, -30, 30, 90] : [-45, 45]).map((rotation, index) => <div key={ rotation } className="single-dot-wrapper" style={ {'transform': `rotate(${-rotation}deg)`} }>
                                    <div className="single-dot-sub-wrapper" style={ {'transform': `rotate(${ringClass === 'half-ring' && index < 2 ? 180 : 0}deg)`} }>
                                        <div className="ring-dot" onClick={ () => {this.moveToOption((this.props.top === true) ? 3 - index : 1 - index)} }
                                            /* onTouchStart={ () => {this.moveToOption((this.props.true === true) ? 3 - index : 1 - index)} } */>
                                        </div>
                                    </div>
                                </div>) }
                            </div>
                        </div>
                    </div>
                </div>
                <div className={ `curved-slide-handle slide-handle ${slideClass}` }
                    id={ `${this.ringId}-slide-handle` } style={ {'transform': 'rotate(45deg) translate3d(0px, 0px, 0px)', 'cursor': (dragging) ? 'inherit' : 'grab' } }
                    onMouseDown={ (e) => {e.preventDefault();this.startDrag(e)} }
                    onTouchStart={ (e) => {e.preventDefault();this.startDrag(e,true)} }>
                </div>
                <div className={ `${ringWrapperClass}` }>
                    <div className={ `inner-text ${textClass}` }>{ this.props.title }</div>
                </div>
            </div>
        </div>
    }
}

export default CurvedSlideComponent;