//MODELS OF CLARIFAI Update 24-07-2020
//let App = require('./App');
// let {version} = require('./../package.json');

// module.exports = global.Clarifai = {
//   version,
//   App,
//   GENERAL_MODEL: 'aaa03c23b3724a16a56b629203edc62c',
//   FOOD_MODEL: 'bd367be194cf45149e75f01d59f77ba7',
//   TRAVEL_MODEL: 'eee28c313d69466f836ab83287a54ed9',
//   NSFW_MODEL: 'e9576d86d2004ed1a38ba0cf39ecb4b1',
//   WEDDINGS_MODEL: 'c386b7a870114f4a87477c0824499348',
//   WEDDING_MODEL: 'c386b7a870114f4a87477c0824499348',
//   COLOR_MODEL: 'eeed0b6733a644cea07cf4c60f87ebb7',
//   CLUSTER_MODEL: 'cccbe437d6e54e2bb911c6aa292fb072',
//   FACE_DETECT_MODEL: '53e1df302c079b3db8a0a36033ed2d15',
//   LOGO_MODEL: 'c443119bf2ed4da98487520d01a0b1e3',
//   DEMOGRAPHICS_MODEL: 'c0c0ac362b03416da06ab3fa36fb58e3',
//   GENERAL_EMBED_MODEL: 'bbb5f41425b8468d9b7a554ff10f8581',
//   FACE_EMBED_MODEL: 'e15d0f873e66047e579f90cf82c9882z',
//   APPAREL_MODEL: 'e0be3b9d6a454f0493ac3a30784001ff',
//   MODERATION_MODEL: 'd16f390eb32cad478c7ae150069bd2c6',
//   TEXTURES_AND_PATTERNS: 'fbefb47f9fdb410e8ce14f24f54b47ff',
//   LANDSCAPE_QUALITY: 'bec14810deb94c40a05f1f0eb3c91403',
//   PORTRAIT_QUALITY: 'de9bd05cfdbf4534af151beb2a5d0953',
//   CELEBRITY_MODEL: 'e466caa0619f444ab97497640cefc4dc'
// };


import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation.js';
import Logo from './Components/Logo/Logo.js';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm.js';
import Rank from './Components/Rank/Rank.js';
import Particles from 'react-particles-js';
import './App.css';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition.js';
import Signin from './Components/Signin/Signin.js';
import Register from './Components/Register/Register.js';
//import { response } from 'express';


const particlesOptions = {
  particles: {
   number: {
     value: 100,
     density: {
       enable: true,
       value_area: 800
     }
   }
  }
}

const initialState = {
  input:'',
  imageUrl: '',
  box: {},
  route: 'signin',//keep track of where we are on the page
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state= initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  // connect from frontend to backend using cors(npm) --> check if they can connect each others? --> done, delete, don't need anymore
  // componentDidMount() {
  //   fetch('http://localhost:3001')
  //     .then(response => response.json())
  //     .then(console.log)
  // }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('http://localhost:3001/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            input: this.state.input        
          })
        })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id        
              })
            })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })  //to make sure change only user.id (entry count) and remain name
          .catch(console.log)  
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })            
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState ({route: route});
  }

  render() {
   const { isSignedIn, imageUrl, route, box } = this.state;
    return (
    <div className="App">
      <Particles className='particles'
              params={particlesOptions}
            />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
      { route === 'home'
      ? <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl}/>
        </div>
      : (
        route === 'signin'
        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      )
      } 
    </div>
  );
}
}

export default App;
