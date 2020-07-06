import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from '../components/Navigation/Navigation';
import Logo from '../components/Logo/Logo';
import ImageLinkForm from '../components/ImageLinkForm/ImageLinkForm';
import FaceDetect from '../components/FaceDetect/FaceDetect';
import Rank from '../components/Rank/Rank';
import Signin from '../components/Signin/Signin';
import Register from '../components/Register/Register';
import Profile from '../components/Profile/Profile';
import Modal from '../components/Modal/Modal';

import './App.css';

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
    box: [],
    route: 'signin',    
    isSignedIn: false,
    isProfileOpen: false,    
    user: {
        id: '',
        name: '',
        email: '',                
        entries: 0,
        joined: '',
        pet: '',
        age: ''
    }
};

class App extends Component {
    
    constructor() {
        super();
        
        this.state = initialState;
    }

    componentDidMount() {
        const token = window.sessionStorage.getItem('token');
        if (token) {
            // 3001
            fetch('http://localhost:3001/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.id) {
                // 3001
                fetch(`http://localhost:3001/profile/${data.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                })
                .then(response => response.json())
                .then(user => {
                    if (user && user.email) {
                        this.loadUser(user)
                        this.onRouteChange('home');
                    }
                })
            }
        })
        .catch(console.log)
        }
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
        if(data && data.outputs) {
            const FaceDetect = data.outputs[0].data.regions;
            let boundingBoxArray = [];
            const image = document.getElementById('input-image');
            const width = Number(image.width);
            const height = Number(image.height);
            for (let face of FaceDetect) {
                let percentageCoordinates = face.region_info.bounding_box;
                let idBoundingBox = face.id;
                let pixelCoordinates = {
                    id: idBoundingBox,
                    leftCol: percentageCoordinates.left_col * width,
                    topRow: percentageCoordinates.top_row * height,
                    rightCol: width - (percentageCoordinates.right_col * width),
                    bottomRow: height - (percentageCoordinates.bottom_row * height)
                };
                boundingBoxArray.push(pixelCoordinates);
            }
            return boundingBoxArray;
        }
        return;
    }    
    
    displayFaceBox = (box) => {
        if(box) {
            this.setState({box: box});
        }        
    }
    
    onInputChange = (event) => {
        this.setState({input: event.target.value});
    }
    
    onPicSubmit = () => {
        this.setState({imageUrl: this.state.input});
        
        fetch('https://mighty-scrubland-27017.herokuapp.com/imageurl', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('token')
            },
            body: JSON.stringify({
                input: this.state.input
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response) {
                fetch('https://mighty-scrubland-27017.herokuapp.com/image', {
                    method: 'put',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': window.sessionStorage.getItem('token')
                    },
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
            return this.setState(initialState);
        } else if(route === 'home') {
            this.setState({ isSignedIn: true });
        }
        this.setState({ route: route });
    }

    toggleModal = () => {
        this.setState(state => ({
          ...state,
          isProfileOpen: !state.isProfileOpen,
        }));
      }
    
    render() {        
        const { imageUrl, box, route, isSignedIn, isProfileOpen, user } = this.state;
        
        return (
            <div className="App">
                <Particles className='particles' params={particlesOptions}/>
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} toggleModal={this.toggleModal}/>
                {
                    isProfileOpen &&
                    <Modal>
                        <Profile isProfileOpen={isProfileOpen} toggleModal={this.toggleModal} user={user} loadUser={this.loadUser} />
                    </Modal>
                }               
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
