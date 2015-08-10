# Collaborative Drawing Application

## Introduction
This showcases collaborative drawing via HTML5 Canvas and WebSockets.

## Building
Simply run the following commands:

```
npm intall;
gulp build;
```

## Running
There are two things needing run; the HTTP Server and the WebSockets Server. Using two different terminal windows / processes, run them both with the following commands:

HTTP Server:
```
gulp server;
```

WebSockets Server:
```
cd js/src;
node server.js
```