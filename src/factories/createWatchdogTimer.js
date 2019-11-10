// @flow

import log from '../Logger';
import type {
  WatchdogTimerType,
  WatchdogTimerConfigurationInputType,
} from '../types';

export default (configuration: WatchdogTimerConfigurationInputType): WatchdogTimerType => {
  let consequentTimeouts = 0;

  let timeoutId;

  const routine = () => {
    timeoutId = setTimeout(() => {
      consequentTimeouts++;

      log.error('watchdog timer timeout');

      configuration.onTimeout({
        consequentTimeouts,
      });

      if (timeoutId) {
        routine();
      }
    }, configuration.timeout);

    // $FlowFixMe
    timeoutId.unref();
  };

  routine();

  const destroy = () => {
    if (!timeoutId) {
      log.warn('watchdog timer has been already destroyed');

      return;
    }

    log.trace('watchdog timer has been destroyed');

    clearTimeout(timeoutId);

    timeoutId = undefined;
  };

  const reset = () => {
    if (!timeoutId) {
      log.warn('watchdog timer has been already destroyed');

      return;
    }

    consequentTimeouts = 0;

    log.trace('watchdog timer has been reset');

    // $FlowFixMe
    timeoutId.refresh();
  };

  return {
    destroy,
    reset,
  };
};
