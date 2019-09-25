export const ITestService = 'ITestService';

export interface ITestService {
  someMethod(): void;
}

export class TestService implements ITestService {
  someMethod(): void {
    throw new Error('Method not implemented.');
  }
}
