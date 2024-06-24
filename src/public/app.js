const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("muteAudio");
const cameraBtn = document.getElementById("muteVideo");
const camreaList = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } }, // require the specific camera
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras(); // update camera list
    }
  } catch (err) {
    console.error(err);
  }
}

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camreaList.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}

function handleMuteClick() {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
    console.log(track);
  });
  if (!muted) {
    muteBtn.innerText = "UnMute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
    console.log(track);
  });
  if (!cameraOff) {
    cameraBtn.innerText = "CameraON";
    cameraOff = true;
  } else {
    cameraBtn.innerText = "CameraOFF";
    cameraOff = false;
  }
}

async function handleCameraChange() {
  await getMedia(camreaList.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    console.log(videoSender);
    // RTCRtpSender : control and obtain details about MediaStreamTrack sent to a remote peer
    // 다른 브라우저로 보내진 비디오/오디오 데이터를 컨트롤
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camreaList.addEventListener("input", handleCameraChange);

///////////////////// Welcome Form (join a room) ///////////////////

const welcome = document.getElementById("welcome");
const welcomeFrom = welcome.querySelector("form");

welcomeFrom.addEventListener("submit", handleWelcomeSubmit);

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeFrom.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value); // 타이밍 이슈때문에 initCall을 callback이 아닌 그 전에 불러야함
  roomName = input.value;
  input.value = "";
}

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);

  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}

function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  console.log("got Peer's stream", data.stream.id);
  console.log("our stream", myStream.id);
  const peerStream = document.getElementById("peerFace");
  peerStream.srcObject = data.stream;
}

socket.on("welcome", async () => {
  // 1. someone joined -> send offer to others
  console.log("someone joined");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  // a. take & set(reomte) someone's offer
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  // b. create & set(local) my answer
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  // c. send my answer to someone
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  // 2. set someone's answer(remote)
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});
