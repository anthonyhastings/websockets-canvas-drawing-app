'use strict';

// Loading dependencies.
import $ from 'jquery';
import socketIO from 'socket.io-client';
import CanvasModule from './canvas';
import CursorsModule from './cursors';
import eventBus from './events';

$(function() {
    // Establishing connection.
    var socket = socketIO('http://localhost:1234');

    // Generate a rudimentary unique identifier.
    var clientID = Math.round($.now() * Math.random());

    // Start our modular code classes.
    var canvasModule = new CanvasModule();
    var cursorsModule = new CursorsModule();

    /**
     * Whenever the CanvasModule signals that the user is
     * moving around, we pass the data to the server via
     * websockets, appending the data with our Client ID.
     *
     * @param {Object} event - DOM Event.
     * @param {Object} canvasData - Data from CanvasModle.
     */
    eventBus.on('clientMouseMove', function(event, canvasData) {
        canvasData.clientID = clientID;
        socket.emit('mousemove', canvasData);
    });

    /**
     * Whenever the socket receives data we ensure a cursor object exists
     * for this client then draw a line if needs be from their old
     * co-ordinates stored to their newly received co-ordinates. Also move
     * the clients cursor to match new co-ordinates.
     *
     * @param {Object} data - Canvas data and Client ID from another user.
     */
    socket.on('moving', function(data) {
        var cursorObject = cursorsModule.getCursor(data.clientID);

        if (!cursorObject) {
            cursorObject = cursorsModule.createCursor(data);
        }

        if (data.isUserDrawing) {
            canvasModule.drawLine(cursorObject.x, cursorObject.y, data.x, data.y);
        }

        cursorsModule.moveCursor(data);
    });

    /**
     * Whenever the user mouses down anywhere, remove
     * the instructions element from the DOM.
     */
    $('body').one('mousedown', function() {
        $('.js-instructions').fadeOut(function() {
            $(this).remove();
        });
    });
});
