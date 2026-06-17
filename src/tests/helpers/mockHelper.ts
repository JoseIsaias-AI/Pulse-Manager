export function asMockedDependency<T>(mock: Partial<jest.Mocked<T>>): jest.Mocked<T> {
  return mock as jest.Mocked<T>;
}
