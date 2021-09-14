import { Layer } from 'expression-globals-typescript';
import { animate } from './index';

// This let's Jest: ReferenceError: Cannot access before initialization
// https://stackoverflow.com/questions/61157392/jest-mock-aws-sdk-referenceerror-cannot-access-before-initialization
jest.mock('expression-globals-typescript', () => {
  const mLayer = { getItem: jest.fn().mockReturnThis(), promise: jest.fn() };
  return { Layer: jest.fn(() => mLayer) };
});

test('animates between default keys', () => {
  expect(
    animate(
      [
        { keyTime: 0, keyValue: 0 },
        { keyTime: 1, keyValue: 1 },
      ],
      { inputTime: 0.5 }
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
      { inputTime: 0.5 }
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
      { inputTime: 0.5 }
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
      { inputTime: 2.5 }
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
      { inputTime: 0.5 }
    )
  ).toEqual([0.5, 0.5, 0.5]);
});

test('animates with custom linear interpolator', () => {
  expect(
    animate(
      [
        { keyTime: 0, keyValue: 0 },
        { keyTime: 1, keyValue: 1 },
      ],
      { inputTime: 0.5, interpolator: x => x }
    )
  ).toBe(0.5);
});

test('animates with custom quad interpolator', () => {
  expect(
    animate(
      [
        { keyTime: 0, keyValue: 0 },
        { keyTime: 1, keyValue: 1 },
      ],
      {
        inputTime: 0.3,
        interpolator: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      }
    )
  ).toBe(0.18);
});

test('errors if keys are different dimensions', () => {
  expect(() =>
    animate(
      [
        { keyTime: 0, keyValue: 0 },
        { keyTime: 1, keyValue: [1, 1, 1] },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError(
    'Keyframe 0 and 1 values must be of the same type. Received number and array'
  );
});

test('errors if a key value is missing', () => {
  expect(() =>
    // @ts-ignore
    animate([{ keyTime: 0 }, { keyTime: 1, keyValue: 1 }], { inputTime: 0.5 })
  ).toThrowError('keyValue is required in keyframe 0');
});

test('errors if a key time is missing', () => {
  expect(() =>
    // @ts-ignore
    animate([{ keyValue: 0 }, { keyTime: 1, keyValue: 1 }], { inputTime: 0.5 })
  ).toThrowError('keyValue is required in keyframe 0');
});

test('errors if a key time is a string', () => {
  expect(() =>
    animate(
      [
        // @ts-ignore
        { keyValue: 0, keyTime: '0' },
        { keyTime: 1, keyValue: 1 },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError('Keyframe 0 time must be of type number. Received string');
});

test('errors if a key value is a string', () => {
  expect(() =>
    animate(
      [
        // @ts-ignore
        { keyValue: '0', keyTime: 0 },
        { keyTime: 1, keyValue: 1 },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError(
    'Keyframe 0 value must be of type number,array. Received string'
  );
});

test('errors if easeIn is a string', () => {
  expect(() =>
    animate(
      [
        // @ts-ignore
        { keyValue: 0, keyTime: 0, easeIn: '0' },
        { keyTime: 1, keyValue: 1 },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError('Keyframe 0 easeIn must be of type number. Received string');
});

test('errors if easeOut is a string', () => {
  expect(() =>
    animate(
      [
        // @ts-ignore
        { keyValue: 0, keyTime: 0, easeOut: '0' },
        { keyTime: 1, keyValue: 1 },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError('Keyframe 0 easeOut must be of type number. Received string');
});

test('errors if velocityIn is a string', () => {
  expect(() =>
    animate(
      [
        // @ts-ignore
        { keyValue: 0, keyTime: 0, velocityIn: '0' },
        { keyTime: 1, keyValue: 1 },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError(
    'Keyframe 0 velocityIn must be of type number. Received string'
  );
});

test('errors if velocityOut is a string', () => {
  expect(() =>
    animate(
      [
        // @ts-ignore
        { keyValue: 0, keyTime: 0, velocityOut: '0' },
        { keyTime: 1, keyValue: 1 },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError(
    'Keyframe 0 velocityOut must be of type number. Received string'
  );
});

test('errors on unexpected keyframe property', () => {
  expect(() =>
    animate(
      [
        { keyTime: 0, keyValue: 0 },
        // @ts-ignore
        { keyTime: 1, keyValue: 1, ease: 0 },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError('Unexpected property on keyframe 1: ease');
});

test('errors if values are arrays of different lengths', () => {
  expect(() =>
    // @ts-ignore
    animate(
      [
        { keyTime: 0, keyValue: [0, 0] },
        { keyTime: 1, keyValue: [1, 1, 1] },
      ],
      { inputTime: 0.5 }
    )
  ).toThrowError(
    'Keyframe 0 and 1 values must be of the same dimension. Received 2 and 3'
  );
});
