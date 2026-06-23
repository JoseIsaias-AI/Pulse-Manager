export function expectSuccessContract(body: unknown): asserts body is {
  success: true;
  data: any;
  message: string;
} {
  expect(body).toEqual(expect.objectContaining({
    success: true,
    data: expect.anything(),
    message: expect.any(String)
  }));
  expect((body as { message: string }).message.trim().length).toBeGreaterThan(0);
}

export function expectErrorContract(body: unknown): asserts body is {
  success: false;
  data: null;
  message: string;
} {
  expect(body).toEqual(expect.objectContaining({
    success: false,
    data: null,
    message: expect.any(String)
  }));
  expect((body as { message: string }).message.trim().length).toBeGreaterThan(0);
}
