import React, { FC, useEffect, useRef, useState } from 'react';
import { Message, Progress, Segment } from 'semantic-ui-react';

import { getSizeText, toRounded } from '../../../utilities/numbers';
import { ISnack, IUpdateMessage } from './snacks';

export const Snack: FC<ISnack> = ({ type, content, update }) => {
  const startStamp = useRef(Date.now());

  const [progress, setProgress] = useState<IUpdateMessage>({ current: 0, total: 0 });
  const [duration, setDuration] = useState<number>(0);
  useEffect(() => {
    if (update) {
      const subscription = update.subscribe({
        next: update => {
          setProgress(update);
          setDuration(Date.now() - startStamp.current);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [update]);

  let message;

  switch (type) {
    case 'success':
      message = <Message floating compact content={content} size='big' success />;
      break;
    case 'info':
      message = <Message floating compact content={content} size='big' info />;
      break;
    case 'warning':
      message = <Message floating compact content={content} size='big' warning />;
      break;
    case 'error':
      message = <Message floating compact content={content} size='big' error />;
      break;
    case 'update':
      const { current, total } = progress;
      const [sent, unit] = getSizeText(current, 2);

      let updateContent = `${sent} ${unit}`;

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

        updateContent += ` at ${getSizeText(rate, 2)[0]} ${unit}/s${remainingTimeSegments.join(' ')} to go`;
      }

      const percent = toRounded((current / total) * 100);

      message = (
        <Message floating compact size='big' info>
          {content}
          {update && <Progress percent={percent} content={updateContent} progress indicating autoSuccess />}
        </Message>
      );
      break;
  }

  return <Segment basic>{message}</Segment>;
};
