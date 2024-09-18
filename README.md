# WebRTC Platform

## Web RTC

With [WebRTC](https://webrtc.org/), you can add real-time communication capabilities to your application that works on top of an open standard. It supports video, voice, and generic data to be sent between peers, allowing developers to build powerful voice and video-communication solutions. The technology is available on all modern browsers as well as on native clients for all major platforms. The technologies behind WebRTC are implemented as an open web standard and available as regular JavaScript APIs in all major browsers. For native clients, like Android and iOS applications, a library is available that provides the same functionality. The WebRTC project is open-source and supported by Apple, Google, Microsoft and Mozilla, amongst others. This page is maintained by the Google WebRTC team.

## Deploy the Platform

- Create your TLS credentials `server.key` and `server.crt` into the `./ssl` folder. 

> For testing, it is possible to use the [OpenSSL](https://www.openssl.org) to generate the TLS credentials.

- `npm install`
- `node index.js`
- Visit the `https://127.0.0.1:3000`

## How to Use

- Person 1
  - Click **Open** button to get the video stream
  - Enter the user nams and click **Call** button to start up the call, and you will get the room id.
  - Provide the room id to another person, enter the roomId and user name

- Person 2
  - Click **Open** button to get the video stream
  - Enter the room id and user name, click the **Answer** button to join the room

After the above you both can see each other. Can also use the chat room to send the message.

