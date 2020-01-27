import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Message, Progress, Segment } from 'semantic-ui-react';

import { header } from '../../../terms.en-us.json';
import { getSizeText, toRounded } from '../../../utilities/numbers';
import { format } from '../../../utilities/strings';
import { ISnack, IUpdateMessage, SnackType } from './snacks';

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

  const getMessage = useCallback(
    (type: SnackType) => {
      switch (type) {
        case 'success':
          return <Message floating compact content={content} size='big' success />;
        case 'info':
          return <Message floating compact content={content} size='big' info />;
        case 'warning':
          return <Message floating compact content={content} size='big' warning />;
        case 'error':
          return <Message floating compact content={content} size='big' error />;
        case 'update':
          const { current, total } = progress;
          const [sent, sentUnit] = getSizeText(current, 2);

          let updateContent = `${sent} ${sentUnit}`;

          const { waitingToSend, hours, minutes, seconds, atToGo } = header.snacks;

          if (sent === 0) {
            updateContent = waitingToSend;
          }

          if (duration !== undefined && duration > 0) {
            const remainingMilliseconds = (total - current) * (duration / current);

            const remainingTimeSegments = [','];

            const remainingHoursMilliseconds = remainingMilliseconds % (60 * 60 * 1000);

            const remainingHours = (remainingMilliseconds - remainingHoursMilliseconds) / 60 / 60 / 1000;
            remainingHours > 0 && remainingTimeSegments.push(format(hours, remainingHours.toString()));

            const remainingMinutesMilliseconds = remainingHoursMilliseconds % (60 * 1000);

            const remainingMinutes = (remainingHoursMilliseconds - remainingMinutesMilliseconds) / 60 / 1000;
            remainingMinutes > 0 && remainingTimeSegments.push(format(minutes, remainingMinutes.toString()));

            const remainingSecondsMilliseconds = remainingMinutesMilliseconds % 1000;

            const remainingSeconds = (remainingMinutesMilliseconds - remainingSecondsMilliseconds) / 1000;
            remainingTimeSegments.push(format(seconds, remainingSeconds.toString()));

            const [rate, rateUnit] = getSizeText((current / duration) * 1000, 2);

            updateContent += format(atToGo, rate.toString(), rateUnit, remainingTimeSegments.join(' '));
          }

          const percent = toRounded((current / total) * 100);

          return (
            <Message floating compact size='big' info>
              {content}
              {update && <Progress percent={percent} content={updateContent} progress indicating autoSuccess />}
            </Message>
          );
      }
    },
    [content, duration, progress, update]
  );

  return <Segment basic>{getMessage(type)}</Segment>;
};
