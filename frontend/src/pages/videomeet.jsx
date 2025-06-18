import React, { useEffect, useState } from 'react'

// import server from '../environment';
import { useRef } from 'react';

// const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls" : "stun:stun.l.google.com:19302"}
    ]
}

function Videomeet() {

    let socketref = useRef();

    let socketIdref = useRef();

    let localVideoRef = useRef();

    let [videoAvilable, setVideoAvailable] = useState(true);

    let [audioAvilabe, setAudioAvailbale] = useState(true);

    let [video, setVideo] = useState();

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();
    
    let [showModal, setModal] = useState(true);
    
    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setmessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    let videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    useEffect(() => {
      getpermissions();
    })

    const getpermissions = async () => {
      try {
        // for video permission
        const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });

        // set video avilable to true/flase based on hardware permission by user
        if(videoPermission) {
          setVideoAvailable(true);
          console.log("Video permission granted");
        } else {
          setVideoAvailable(false);
          console.log("Video permission denied");
        }

        // for audio permission
        const audioPermission = navigator.mediaDevices.getUserMedia({ audio: true });

        // set audio avilable to true/flase based on hardware permission by user
        if(audioPermission) {
          setAudioAvailbale(true);
          console.log("Audio permission granted");
        } else {
          setAudioAvailbale(false);
          console.log("Audio permission denied");
        }
        if(videoAvilable || audioAvilabe) {
          const userMediaStream = await navigator.getUserMedia({ video: videoAvilable, audio: audioAvilabe});
          if(userMedia) {
            window.localStream = userMediaStream;
            if(localVideoRef.current) {
              localVideoRef.current.srcObject = userMediaStream;
            }
          }
        }
      } catch (error) {
        console.log("ERROR:videomeet.jsx:getpermission()::",error);
      }
    }

    let getMedia = () => {
      setVideo(videoAvilable);
      setAudio(audioAvilabe);
    }

    let connect = () => {
      setAskForUsername(flase);
      getMedia();
    }

  return (
    <div>
      {askForUsername ? 
      <div className='w-full h-screen flex flex-col justify-center items-center'>
        <div>
          <input 
            type="text" 
            className='inp-theme rounded-lg' 
            placeholder='Enter Username' 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
          <button className='btn-theme ms-3' onClick={connect}>Join now</button>
        </div>
        <div>
          <video src="" ref={localVideoRef}></video>
        </div>
      </div> 
      : 
      <>
      Without Username
      </>}
    </div>
  )
}

export default Videomeet
