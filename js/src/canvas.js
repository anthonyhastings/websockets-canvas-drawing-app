'use strict';

// Loading dependencies.
import $ from 'jquery';
import _ from 'underscore';
import eventBus from './events';

// Setting class constants.
const EMIT_THRESHOLD = 30;

class CanvasModule {

    /**
     * Creates and sets up the canvas context and dimensions.
     */
    constructor() {
        /**
         * Denotes if the user is currently moused down and drawing.
         *
         * @type {Boolean}
         */
        this.isUserDrawing = false;

        /**
         * The timestamp upon which this client last emitted data.
         *
         * @type {Number}
         */
        this.lastEmittedOn = $.now();

        /**
         * The last recorded co-ordinates the user was drawing.
         *
         * @type {Object}
         */
        this.lastRecordedDrawingCoordinates = {
            x: null,
            y: null
        };

        /**
         * Denotes the current dimensions of the canvas element.
         *
         * @type {Object}
         */
        this.canvasDimensions = null;

        // Setting the selector and context variable.
        this.canvasElement = document.querySelector('.js-canvas');
        this.canvasContext = this.canvasElement.getContext('2d');

        // Applying internal canvas dimensions to match CSS dimensions.
        this.setCanvasDimensions();

        // Creating debounced and bound event listeners.
        this._boundOnResize = this.onResize.bind(this);
        this._boundOnMouseDown = this.onMouseDown.bind(this);
        this._boundOnBodyMouseMove = this.onBodyMouseMove.bind(this);
        this._boundOnMouseUp = this.onMouseUp.bind(this);
        this._debouncedOnResize = _.debounce(this._boundOnResize, 250);

        // Binding events.
        $(document).on('mouseup mouseleave', this._boundOnMouseUp);
        $('body').on('mousemove', this._boundOnBodyMouseMove);
        $(this.canvasElement).on('mousedown', this._boundOnMouseDown);
        $(window).on('resize', this._debouncedOnResize);
    }

    /**
     * Draws a line on the canvas from one set of
     * co-ordinates to another.
     *
     * @param {Number} fromX
     * @param {Number} fromY
     * @param {Number} toX
     * @param {Number} toY
     */
    drawLine(fromX, fromY, toX, toY) {
        this.canvasContext.moveTo(fromX, fromY);
        this.canvasContext.lineTo(toX, toY);
        this.canvasContext.stroke();
    }

    /**
     * Captures the DOM width and height of the canvas element, then
     * applies it to the properties used by the canvas context.
     */
    setCanvasDimensions() {
        this.canvasDimensions = {
            width: this.canvasElement.offsetWidth,
            height: this.canvasElement.offsetHeight
        };

        this.canvasElement.width = this.canvasDimensions.width;
        this.canvasElement.height = this.canvasDimensions.height;
    }

    /**
     * As the user clicks their mouse down, flag them as
     * drawing and record the co-ordinates they started
     * drawing at.
     *
     * @param {Object} event - DOM Event.
     */
    onMouseDown(event) {
        this.isUserDrawing = true;
        this.lastRecordedDrawingCoordinates.x = event.pageX;
        this.lastRecordedDrawingCoordinates.y = event.pageY;
    }

    /**
     * Compare the timestamp for this mouse move operation against last
     * data emission. If it exceeds the threshold, emit new client data
     * via sockets. If user was drawing then draw the line (as clients
     * own data is never returned via sockets).
     *
     * @param {Object} event - DOM Event.
     */
    onBodyMouseMove(event) {
        var currentTimestamp = $.now();

        if ((currentTimestamp - this.lastEmittedOn) > EMIT_THRESHOLD) {
            eventBus.trigger('clientMouseMove', {
                x: event.pageX,
                y: event.pageY,
                isUserDrawing: this.isUserDrawing
            });

            this.lastEmittedOn = currentTimestamp;
        }

        if (this.isUserDrawing) {
            this.drawLine(
                this.lastRecordedDrawingCoordinates.x,
                this.lastRecordedDrawingCoordinates.y,
                event.pageX,
                event.pageY
            );

            this.lastRecordedDrawingCoordinates.x = event.pageX;
            this.lastRecordedDrawingCoordinates.y = event.pageY;
        }
    }

    /**
     * The user releaseing their mouse causes our
     * internal drawing flag to falseify.
     */
    onMouseUp() {
        this.isUserDrawing = false;
    }

    /**
     * Upon resizing the window we update the dimensions of the
     * canvas to match the window.
     */
    onResize() {
        this.setCanvasDimensions();
    }

}

export default CanvasModule;
