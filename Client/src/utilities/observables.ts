import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export const useSubscription = <T>(observable: Observable<T>, initialValue?: T) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const subscription = observable.subscribe({ next: newValue => setValue(newValue) });
    return () => subscription.unsubscribe();
  }, [observable]);

  return value;
};
