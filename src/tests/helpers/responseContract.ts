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

export function expectContrato(body: unknown): void {
  expect(body).toEqual(expect.objectContaining({
    success: expect.any(Boolean),
    message: expect.any(String)
  }));

  expect(body).toHaveProperty('data');
  expect((body as { message: string }).message.trim().length).toBeGreaterThan(0);

  if ((body as { success: boolean }).success === false) {
    expect((body as { data: unknown }).data).toBeNull();
  } else {
    expect((body as { data: unknown }).data).not.toBeUndefined();
  }
}
