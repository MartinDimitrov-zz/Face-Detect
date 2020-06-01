import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';
import Navigation from '../components/Navigation/Navigation';
import Logo from '../components/Logo/Logo';
import ImageLinkForm from '../components/ImageLinkForm/ImageLinkForm';
import FaceDetect from '../components/FaceDetect/FaceDetect';
import Signin from '../components/Signin/Signin';
import Register from '../components/Register/Register';

const app = new Clarifai.App({
    apiKey: '301c610023e540bf9c5554abf72f76b5'
});

const particlesOptions = {
    particles: {
            number: {
                value: 30,
                density: {
                    enable: true,
                    value_area: 800
                }
            }
        }
    };

class App extends Component {
    
    constructor() {
        super();
        
        this.state = {
            input: '',
            imageUrl: '',
            box: {},
            route: 'signin',
            isSignedIn: false
        };
    }
    
    calculateFaceLocation = (data) => {
        const FaceDetect = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('input-image');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: FaceDetect.left_col * width,
            topRow: FaceDetect.top_row * height,
            rightCol: width - (FaceDetect.right_col * width),
            bottomRow: height - (FaceDetect.bottom_row * height)
        };
    }
    
    displayFaceBox = (box) => {
        this.setState({box: box});
    }
    
    onInputChange = (event) => {
        this.setState({input: event.target.value});
    }
    
    onButtonSubmit = () => {
        this.setState({imageUrl: this.state.input});
        
        app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
            .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
            .catch(err => console.log(err));
    }
    
    onRouteChange = (route) => {
        if(route === 'signout') {
            this.setState({ isSignedIn: false });
        } else if(route === 'home') {
            this.setState({ isSignedIn: true });
        }
        this.setState({ route: route });
    }
    
    render() {        
        const { imageUrl, box, route, isSignedIn } = this.state;
        
        return (
            <div className="App">
                <Particles className='particles' params={particlesOptions}/>
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>                
                {route === 'home'
                    ? <div> 
                        <Logo />
                        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
                        <FaceDetect box={box} imageUrl={imageUrl} />
                      </div>                    
                    :(
                      route === 'signin'
                      ? <Signin onRouteChange={this.onRouteChange}/>
                      : <Register onRouteChange={this.onRouteChange}/>
                    )                                        
                }
            </div>
        );
    }
    
};

export default App;
