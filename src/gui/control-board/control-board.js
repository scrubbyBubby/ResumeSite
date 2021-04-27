import React from 'react';
import './control-board.css';

import SlideControl from '../slide-control/slide-control.js';
import CurvedSlideControl from '../curved-slide-control/curved-slide-control.js';

const urlToTabChoice = {
    'r%C3%A9sum%C3%A9': 'Résumé',
    'project-1': 'Project 1',
    'project-2': 'Project 2',
    '?????': '?????',
}

class ControlBoard extends React.Component {
    constructor() {
        super();
        this.state = {
            optionList: ['Résumé', 'Project 1', 'Project 2', '?????'],
            themeOptionList: ['green','yellow','blue','purple'],
            modeOptionList: ['dark','light'],
        }

        const pathname = window.location.pathname.substring(1);
        //this.initialChoice = urlToTabChoice[pathname] || 'Résumé';
        console.log(`initialChoice on load is ${this.initialChoice}`);
    }

    componentDidMount() {
        //this.props.setTabChoice(this.initialChoice);
    }

    render() {
        return <div className="main-control-board-inner">
            <div className="main-slide-control">
                <SlideControl id="tab-control" 
                    tabChoice={ this.props.tabChoice }
                    setTabChoice={ this.props.setTabChoice }
                    vertical={ false } 
                    initialChoice={ this.initialChoice }
                    optionList={ this.state.optionList }></SlideControl>
            </div>
            <div className="main-dial-control">
                <CurvedSlideControl ringType="half" top={ true } id="theme-control"
                    title="Theme" initialChoice="0"
                    choice={ this.props.themeChoice }
                    setChoice={ this.props.setThemeChoice }
                    optionList={ this.state.themeOptionList }>
                </CurvedSlideControl>
                <CurvedSlideControl ringType="quarter" top={ false } id="mode-control"
                    title="Mode" initialChoice="0"
                    choice={ this.props.modeChoice }
                    setChoice={ this.props.setModeChoice }
                    optionList={ this.state.modeOptionList }>
                </CurvedSlideControl>
            </div>
        </div>;
    }
}

export default ControlBoard;