import { animate } from './index';

test('animates between default keys', () => {
  expect(
    animate(
      [
        { keyTime: 0, keyValue: 0 },
        { keyTime: 1, keyValue: 1 },
      ],
      0.5
    )
  ).toBe(0.5);
});

test('animates between eased keys', () => {
  expect(
    animate(
      [
        { keyTime: 0, keyValue: 0, easeOut: 100 },
        { keyTime: 1, keyValue: 1, easeIn: 100 },
      ],
      0.5
    )
  ).toBe(0.5);
});

test('animates between custom velocity keys', () => {
  expect(
    animate(
      [
        { keyTime: 0, keyValue: 0, velocityOut: 20 },
        { keyTime: 1, keyValue: 1, velocityIn: 20 },
      ],
      0.5
    )
  ).toBe(0.5);
});

test('re-orders keys by time', () => {
  expect(
    animate(
      [
        { keyTime: 2, keyValue: 1 },
        { keyTime: 3, keyValue: 0 },
      ],
      2.5
    )
  ).toBe(0.5);
});

test('animates between arrays', () => {
  expect(
    animate(
      [
        { keyTime: 0, keyValue: [0, 0, 0] },
        { keyTime: 1, keyValue: [1, 1, 1] },
      ],
      0.5
    )
  ).toEqual([0.5, 0.5, 0.5]);
});
