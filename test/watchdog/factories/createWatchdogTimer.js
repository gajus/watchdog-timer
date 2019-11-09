// @flow

import test from 'ava';
import sinon from 'sinon';
import delay from 'delay';
import createWatchdogTimer from '../../../src/factories/createWatchdogTimer';

test('calls onTimeout if timeout is reached (reset not called)', async (t) => {
  const timeoutHandler = sinon.spy();

  createWatchdogTimer({
    onTimeout: timeoutHandler,
    timeout: 100,
  });

  await delay(200);

  t.is(timeoutHandler.called, true);
});

test('calls onTimeout if timeout is reached (reset called)', async (t) => {
  const timeoutHandler = sinon.spy();

  const watchdogTimer = createWatchdogTimer({
    onTimeout: timeoutHandler,
    timeout: 200,
  });

  await delay(100);

  watchdogTimer.reset();

  await delay(300);

  t.is(timeoutHandler.called, true);
});

test('does not call onTimeout if timer is destroyed', async (t) => {
  const timeoutHandler = sinon.spy();

  const watchdogTimer = createWatchdogTimer({
    onTimeout: timeoutHandler,
    timeout: 100,
  });

  watchdogTimer.destroy();

  await delay(200);

  t.is(timeoutHandler.called, false);
});

test('calls onTimeout with the number of consequent timeouts', async (t) => {
  const timeoutHandler = sinon.spy();

  createWatchdogTimer({
    onTimeout: timeoutHandler,
    timeout: 100,
  });

  await delay(250);

  t.is(timeoutHandler.callCount, 2);
  t.is(timeoutHandler.args[0][0].consequentTimeouts, 1);
  t.is(timeoutHandler.args[1][0].consequentTimeouts, 2);
});

test('does not call onTimeout on second timeout if timer is destroyed', async (t) => {
  const timeoutHandler = sinon.stub().callsFake(() => {
    // eslint-disable-next-line no-use-before-define
    watchdogTimer.destroy();
  });

  const watchdogTimer = createWatchdogTimer({
    onTimeout: timeoutHandler,
    timeout: 100,
  });

  await delay(250);

  t.is(timeoutHandler.callCount, 1);
});
