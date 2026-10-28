const lib = require("../src/library");

const reader = { id: 1, card: "KP-0123/26", active: true };

test("номер квитка у правильному форматі приймається", () => {
  expect(lib.isValidCard("KP-0123/26")).toBe(true);
  expect(lib.isValidCard("ZV-9876/25")).toBe(true);
});

test("номер квитка з неправильним префіксом відхиляється", () => {
  expect(lib.isValidCard("AB-0123/26")).toBe(false);
});

test("строк повернення — через 14 днів після видачі", () => {
  const due = lib.dueDate(new Date(2026, 8, 1));
  expect(due).toEqual(new Date(2026, 8, 15));
});

test("повернення вчасно — без штрафу", () => {
  expect(lib.calculateFine(new Date(2026, 8, 15), new Date(2026, 8, 14))).toBe(0);
});

test("запізнення на 2 дні — штраф 10 грн", () => {
  expect(lib.calculateFine(new Date(2026, 8, 15), new Date(2026, 8, 17))).toBe(10);
});

test("читач із трьома книгами не може взяти четверту", () => {
  const loans = [1, 2, 3].map((bookId) => ({ readerId: 1, bookId, returnedAt: null }));
  expect(lib.canBorrow(reader, loans)).toBe(false);
});
