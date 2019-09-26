import React, { FC, useEffect, useRef, useState } from 'react';
import { Message, Progress, Segment } from 'semantic-ui-react';

import { getSizeText, toRounded } from '../../../utilities/numbers';
import { UpdateSnackHandler } from './snacks';

export type SnackType = 'success' | 'info' | 'warning' | 'error' | 'update';

export interface ISnack {
  text: string;
  type: SnackType;
  update?: UpdateSnackHandler;
  key?: number;
}

export interface IUpdateMessage {
  current: number;
  total: number;
  duration?: number;
}

export const Snack: FC<ISnack> = ({ type, text, update }) => {
  const [progress, setProgress] = useState<IUpdateMessage>({ current: 0, total: 0 });
  const startStamp = useRef(Date.now());

  useEffect(() => {
    if (update) {
      const subscription = update.subscribe({
        next: update => setProgress({ ...update, duration: Date.now() - startStamp.current })
      });

      return () => subscription.unsubscribe();
    }
  }, [update]);

  let message;

  switch (type) {
    case 'success':
      message = <Message floating compact content={text} success />;
      break;
    case 'info':
      message = <Message floating compact content={text} info />;
      break;
    case 'warning':
      message = <Message floating compact content={text} warning />;
      break;
    case 'error':
      message = <Message floating compact content={text} error />;
      break;
    case 'update':
      const { current, total, duration } = progress;
      const [sent, unit] = getSizeText(current, 2);

      let content = `${sent} ${unit}`;

      if (duration !== undefined && duration > 0) {
        const rate = toRounded(current / duration / 1000, 2);

        const remainingMilliseconds = (total - current) * (duration / current);

        const remainingTimeSegments = [','];

        const remainingHoursMilliseconds = remainingMilliseconds % (60 * 60 * 1000);

        const remainingHours = (remainingMilliseconds - remainingHoursMilliseconds) / 60 / 60 / 1000;
        remainingHours > 0 && remainingTimeSegments.push(`${remainingHours} hours`);

        const remainingMinutesMilliseconds = remainingHoursMilliseconds % (60 * 1000);

        const remainingMinutes = (remainingHoursMilliseconds - remainingMinutesMilliseconds) / 60 / 1000;
        remainingMinutes > 0 && remainingTimeSegments.push(`${remainingMinutes} minutes`);

        const remainingSecondsMilliseconds = remainingMinutesMilliseconds % 1000;

        const remainingSeconds = (remainingMinutesMilliseconds - remainingSecondsMilliseconds) / 1000;
        remainingTimeSegments.push(`${remainingSeconds} seconds`);

        content += ` at ${getSizeText(rate, 2)[0]} ${unit}/s${remainingTimeSegments.join(' ')} to go`;
      }

      const percent = toRounded((current / total) * 100);

      message = (
        <Message floating compact info>
          {text}
          {update && <Progress percent={percent} content={content} progress indicating autoSuccess />}
        </Message>
      );
      break;
  }

  return <Segment basic>{message}</Segment>;
};
