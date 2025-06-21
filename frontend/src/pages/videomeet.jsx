import React, { useEffect, useState } from 'react'
import io from "socket.io-client";

// import server from '../environment';
import { useRef } from 'react';

const server_url = "http://localhost:8000";

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

    let [video, setVideo] = useState([]);

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
      getPermissions();
    },[])

    const getPermissions = async () => {
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

        // for screen 

        if(navigator.mediaDevices.getDisplayMedia) {
          setScreenAvailable(true);
        } else {
          setScreenAvailable(false);
        }

        if(videoAvilable || audioAvilabe) {
          const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvilable, audio: audioAvilabe});
          if(userMediaStream) {
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


    // TODO
    let getUserMediaSuccess = (stream) => {
      try {
        window.localStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.log("ERROR:videomeet.jsx:getUserMediaSuccess::", e);
      }

      window.localStream = stream;
      localVideoRef.current.srcObject = stream;

      for(let id in connections) {
        if(id === socketIdref.current) continue

        connections[id].addStream(window.localStream)

        connections[id].createOffer((description) => {
          console.log("videomeet.jsx:getUserMediaSuccess:createOffer:description=>");
          console.log(description)
          connections[id].setLocalDescription(description)
          .then(() => {
            socketref.current.emit("signal", id,JSON.stringify({"sdp": connections[id].localDescription}))
          })
          .catch (e =>  {
            console.log("ERROR:videomeet.jsx:getUserMediaSuccess::", e);
          })
        })
      }

      stream.getTracks().forEach(track => track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          let tracks = localVideoRef.current.srcObject.getTracks()
          tracks.forEach(track => track.stop())
        } catch (e) {console.log("ERROR:videomeet.jsx:getUserMediaSuccess::", e);}

        //TODO blacksilence
        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;
      })
    }

    let silence = () => {
      let ctx = new AudioContext();
      let oscillator = ctx.createOscillator();
       
      let dst = oscillator.connect(ctx.createMediaStreamDestination());

      oscillator.start();
      ctx.resume()
      return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = () => {
      let canvas = Object.assign(document.createElement("canvas"), {width, height});
      canvas.getContext('2d').fillRect(0, 0, width, height);
      let stream = canvas.captureStream() //this is recorde what is drawn by canvas on sscreen
      return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    const getUserMedia = () => {
      if((video && videoAvilable) || (audio && audioAvilabe)) {
        navigator.mediaDevices.getUserMedia({video: video, audio: audio})
        .then(getUserMediaSuccess) //TODO getUserMediaSucess
        .then((stream) => {})
        .catch((e) => {console.log("ERROR:videomeet.jsx:getUserMedia::", e)});
      } else {
        try {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        } catch (e) {
          console.log("ERROR:videomeet.jsx:getUSerMedia:try-catch block::", e);
        }
      }
    }

    useEffect(() => {
        if(video !== undefined && audio !== undefined) {
          getUserMedia();
        }
    }, [audio, video])

    //TODO
    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdref.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    //TODO
    let addMessage = () => {

    }


    let connectToSocketServer = () => {

      socketref.current = io.connect(server_url, { secure: false })

      socketref.current.on("signal", gotMessageFromServer);

      socketref.current.on("connect", () => {
        socketref.current.emit("join-call", window.location.href)

        socketIdref.current = socketref.current.id

        socketref.current.on("chat-message", addMessage)

        socketref.current.on("user-left", (id) => {
          setVideo((videos) => videos.filter((video) => video.socketId !== id))
        })

        socketref.current.on("user-joined", (id, clients) => {
          clients.forEach((socketListId) => {
            connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

            connections[socketListId].onicecandidate = (event) => {
              if(event.candidate !== null) {
                socketref.current.emit("signal", socketListId, JSON.stringify({"ice": event.candidate}))
              }
            }

            connections[socketListId].onaddstream = (event) => {

              let videoExists = videoRef.current.find(video => video.socketId === socketListId);

              if(videoExists) {
                setVideo(videos => {
                  const updatedVideos = videos.map(video => 
                    video.socketId === socketListId ? {...video, stream: event.stream} : video
                  )
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                })
              } else {
                let newVideo = {
                  socketId: socketListId,
                  stream: event.stream,
                  autoPlay: true,
                  playsinline: true
                }

                setVideo(videos => {
                  const updatedVideos = [...videos, newVideo];
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                })
              }

            };

            if(window.localStream !== undefined && window.localStream !== null) {
              connections[socketListId].addStream(window.localStream);
            } else {
              //TODO
              // let blackSlience
              let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
              window.localStream = blackSilence();
              connections[socketListId].addStream(window.localStream)
            }

            if(id === socketIdref.current) {
              for(let id2 in connections) {
                if(id2 === socketIdref.current) continue

                try {
                  connections[id2].addStream(window.localStream)
                } catch (e) {
                  console.log("ERROR:videomeet.jsx:connectToSocketServer::", e);
                }

                connections[id2].createOffer().then((description) => {
                  connections[id2].setLocalDescription(description)
                  .then(() => {
                    socketref.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localdescription }))
                  })
                  .catch(e => console.log("ERROR:videomeet.jsx:connectToSocketServer::", e))
                })
              }
            }
          })
        })
      })

    }

    let getMedia = () => {
      setVideo(videoAvilable);
      setAudio(audioAvilabe);
      connectToSocketServer();
    }

    let connect = () => {
      setAskForUsername(false);
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
        <div className='border '>
          <video ref={localVideoRef} autoPlay></video>
        </div>
      </div> 
      : 
      <>
      Without Username
      <video ref={localVideoRef} autoPlay></video>
      {console.log("video length", videos.length)}
      {videos.map((video) => (
        <div key={video.socketId}>
          {console.log("From test: ", video.socketId)}
        </div>
      ))}
      </>}
    </div>
  )
}

export default Videomeet
