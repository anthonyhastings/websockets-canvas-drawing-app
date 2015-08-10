'use strict';

// Loading dependencies.
import $ from 'jquery';

// Setting class constants.
const INACTIVITY_THRESHOLD = 20000;

class CursorsModule {

    /**
     * Creates a collection for other users cursors and
     * sets up clean up tasks.
     */
    constructor() {
        /**
         * Stores all other connected users and their data.
         *
         * @type {Object}
         */
        this.cursors = {};

        // Caching reference to the cursors container.
        this.$cursorContainer = $('.js-cursor-container');

        // Creating bound event listeners.
        this._boundCheckInactivity = this.checkInactivity.bind(this);

        // Binding events and setting timers.
        this.inactivityCheck = setInterval(this._boundCheckInactivity, INACTIVITY_THRESHOLD);
    }

    /**
     * Checks the internal collection of cursors for a match
     * and returns one if found.
     *
     * @param {String|Number} clientID
     * @return {Object|Boolean}
     */
    getCursor(clientID) {
        if (this.cursors.hasOwnProperty(clientID)) {
            return this.cursors[clientID];
        }

        return false;
    }

    /**
     * Creates a new entry in our cursor collection and returns
     * the new cursor objects reference.
     *
     * @param {Object} cursorData
     * @return {Object}
     */
    createCursor(cursorData) {
        this.cursors[cursorData.clientID] = cursorData;

        var cursorObject = this.cursors[cursorData.clientID];
        cursorObject.$element = $('<div class="cursorContainer__cursor"></div>');
        cursorObject.lastUpdated = $.now();
        this.$cursorContainer.append(cursorObject.$element);

        return cursorObject;
    }

    /**
     * Updates the cursor data with whats been supplied then
     * moves the cursor element on-screen.
     *
     * @param {Object} cursorData
     */
    moveCursor(cursorData) {
        var cursorObject = this.getCursor(cursorData.clientID);

        if (cursorObject) {
            cursorObject.x = cursorData.x;
            cursorObject.y = cursorData.y;
            cursorObject.isUserDrawing = cursorData.isUserDrawing;
            cursorObject.lastUpdated = $.now();
        }

        cursorObject.$element.css({
            transform: 'translate3d(' + cursorObject.x + 'px, ' + cursorObject.y + 'px, 0)'
        });
    }

    /**
     * Cycles each of the cursors stored and checks their
     * inactivity time to see if it exceeds the threshold.
     * If it does, the user has probably disconnected and
     * we remove their cursor.
     */
    checkInactivity() {
        var currentTimestamp = $.now();

        for (let key in this.cursors) {
            var currentCursor = this.cursors[key];

            if (currentTimestamp - currentCursor.lastUpdated > INACTIVITY_THRESHOLD) {
                currentCursor.$element.remove();
                delete this.cursors[key];
            }
        }
    }
}

export default CursorsModule;
