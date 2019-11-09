// @flow

/**
 * @property destroy Called when `reset` is not called within `timeout` interval.
 * @property reset Sets the timer's start time to the current time, and reschedules the timer to call its callback at the previously specified duration adjusted to the current time.
 */
export type WatchdogTimerType = {|
  +destroy: () => void,
  +reset: () => void,
|};

/**
 * @property consequentTimeouts Number of consequent timeouts. Calling `reset` resets `consequentTimeouts` to `0`.
 */
export type TimeoutEventType = {|
  +consequentTimeouts: number,
|};

/**
 * @property onTimeout Called when `reset` is not called within `timeout` interval.
 * @property timeout Timeout interval (in milliseconds).
 */
export type WatchdogTimerConfigurationInputType = {|
  +onTimeout: (event: TimeoutEventType) => void,
  +timeout: number,
|};
