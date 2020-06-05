import React, { Component } from 'react';
import Particles from 'react-particles-js';
import './App.css';
import Navigation from '../components/Navigation/Navigation';
import Logo from '../components/Logo/Logo';
import ImageLinkForm from '../components/ImageLinkForm/ImageLinkForm';
import FaceDetect from '../components/FaceDetect/FaceDetect';
import Rank from '../components/Rank/Rank';
import Signin from '../components/Signin/Signin';
import Register from '../components/Register/Register';

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
    
const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',                
        entries: 0,
        joined: ''
    }
};

class App extends Component {
    
    constructor() {
        super();
        
        this.state = initialState;
    }
    
      loadUser = (data) => {
        this.setState({user: {
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined
        }});
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
    
    onPicSubmit = () => {
        this.setState({imageUrl: this.state.input});
        
        fetch('https://mighty-scrubland-27017.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response) {
                fetch('https://mighty-scrubland-27017.herokuapp.com//image', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: this.state.user.id
                    })
                })
                .then(response => response.json())
                .then(count => {
                    this.setState(Object.assign(this.state.user, { entries: count }));
                })
                .catch(console.log);
            }
            this.displayFaceBox(this.calculateFaceLocation(response));
        })
        .catch(err => console.log(err));
    }
    
    onRouteChange = (route) => {
        if(route === 'signout') {
            this.setState(initialState);
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
                        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                        <ImageLinkForm onInputChange={this.onInputChange} onPicSubmit={this.onPicSubmit}/>
                        <FaceDetect box={box} imageUrl={imageUrl} />
                      </div>                    
                    :(
                      route === 'signin'
                      ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                      : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                    )                                        
                }
            </div>
        );
    }
    
};

export default App;