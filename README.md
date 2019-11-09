# watchdog-timer

[![GitSpo Mentions](https://gitspo.com/badges/mentions/gajus/watchdog-timer?style=flat-square)](https://gitspo.com/mentions/gajus/watchdog-timer)
[![Travis build status](http://img.shields.io/travis/gajus/watchdog-timer/master.svg?style=flat-square)](https://travis-ci.org/gajus/watchdog-timer)
[![Coveralls](https://img.shields.io/coveralls/gajus/watchdog-timer.svg?style=flat-square)](https://coveralls.io/github/gajus/watchdog-timer)
[![NPM version](http://img.shields.io/npm/v/watchdog-timer.svg?style=flat-square)](https://www.npmjs.org/package/watchdog-timer)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Detects and notifies when program does not check-in within a timeout.

* [Motivation](#motivation)
* [API](#api)
* [Example usage](#example-usage)
  * [Using watchdog-timer with `process.exit`](#using-watchdog-timer-with-processexit)
  * [Using watchdog-timer with Lightship](#using-watchdog-timer-with-lightship)

## Motivation

* [Ensuring healthy Node.js program using watchdog timer](https://dev.to/gajus/ensuring-healthy-node-js-program-using-watchdog-timer-4pjd)

## API

```js
import {
  createWatchdogTimer,
} from 'watchdog-timer';

/**
 * @property destroy Called when `reset` is not called within `timeout` interval.
 * @property reset Sets the timer's start time to the current time, and reschedules the timer to call its callback at the previously specified duration adjusted to the current time.
 */
type WatchdogTimerType = {|
  +destroy: () => void,
  +reset: () => void,
|};

/**
 * @property consequentTimeouts Number of consequent timeouts. Calling `reset` resets `consequentTimeouts` to `0`.
 */
type TimeoutEventType = {|
  +consequentTimeouts: number,
|};

/**
 * @property onTimeout Called when `reset` is not called within `timeout` interval.
 * @property timeout Timeout interval (in milliseconds).
 */
type WatchdogTimerConfigurationInputType = {|
  +onTimeout: (event: TimeoutEventType) => void,
  +timeout: number,
|};


createWatchdogTimer(configuration: WatchdogTimerConfigurationInputType) => WatchdogTimerType;

```

## Example usage

### Using watchdog-timer with `process.exit`

A watchdog timeout is one of the rare, valid use cases for forced process termination, i.e. using [`process.exit()`](https://nodejs.org/api/process.html#process_process_exit_code).

```js
import {
  createWatchdogTimer,
} from 'watchdog-timer';

const main = async () => {
  const watchdogTimer = createWatchdogTimer({
    onTimeout: () => {
      console.error('watchdog timer timeout; forcing program termination');

      process.nextTick(() => {
        process.exit(1);
      });
    },
    timeout: 1000,
  });

  while (true) {
    // Reset watchdog-timer on each loop.
    watchdogTimer.reset();

    // `foo` is an arbitrary routine that might hang indefinitely,
    // e.g. due to a hanging database connection socket.
    await foo();
  }
};

main();

```

### Using watchdog-timer with Lightship

[`lightship`](https://github.com/gajus/lightship) is an NPM module for signaling Kubernetes about the health of a Node.js application. In case of watchdog-timer, Lightship can be used to initiate a controlled termination of the Node.js process.

```js
import {
  createWatchdogTimer,
} from 'watchdog-timer';
import {
  createLightship,
} from 'lightship';

const main = async () => {
  const lightship = createLightship({
    timeout: 5 * 1000,
  });

  lightship.signalReady();

  lightship.registerShutdownHandler(async () => {
    console.log('shutting down');
  });

  const watchdogTimer = createWatchdogTimer({
    onTimeout: () => {
      // If you do not call `destroy()`, then
      // `onTimeout` is going to be called again on the next timeout.
      watchdogTimer.destroy();

      lightship.shutdown();
    },
    timeout: 1000,
  });

  while (true) {
    if (lightship.isServerShuttingDown()) {
      console.log('detected that the service is shutting down; terminating the event loop');

      break;
    }

    // Reset watchdog-timer on each loop.
    watchdogTimer.reset();

    // `foo` is an arbitrary routine that might hang indefinitely,
    // e.g. due to a hanging database connection socket.
    await foo();
  }

  watchdogTimer.destroy();
};

main();

```
