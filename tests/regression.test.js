const lib = require("../src/library");

describe("Regression Tests (ISSUES.md)", () => {
  // Баг №1
  test("ISSUES #1: Дата видачі (issueDate) не повинна мутувати", () => {
    const issue = new Date(2026, 8, 10); // 10.09.2026
    const expectedIssueStr = issue.toISOString();

    lib.dueDate(issue); // Цей виклик зараз псує оригінальну дату

    expect(issue.toISOString()).toBe(expectedIssueStr);
  });

  // Баг №2
  test("ISSUES #2: штраф на межі місяців (28.09 - 03.10) дорівнює 25 грн", () => {
    const due = new Date(2026, 8, 28); // 28.09
    const returned = new Date(2026, 9, 3); // 03.10

    expect(lib.calculateFine(due, returned)).toBe(25);
  });

  // Баг №3
  test("ISSUES #3: новий читач без історії видач може взяти книгу", () => {
    const reader = { id: 1, card: "ZV-0456/26", active: true };
    const loans = []; 

    expect(lib.canBorrow(reader, loans)).toBe(true);
  });
});

describe("Завдання 9: renewLoan (Продовження строку)", () => {
  const today = new Date(2026, 8, 10); // 10.09.2026

  test("продовжує строк на 7 днів і не мутує старий об'єкт", () => {
    const loan = { due: new Date(2026, 8, 15), returnedAt: null, renewed: false };
    const renewedLoan = lib.renewLoan(loan, today);
    
    expect(renewedLoan.due).toEqual(new Date(2026, 8, 22)); // 15 + 7 = 22
    expect(renewedLoan.renewed).toBe(true);
    // Перевіряємо імутабельність (старий об'єкт не змінився)
    expect(loan.due).toEqual(new Date(2026, 8, 15)); 
  });

  test("помилка: не можна продовжити більше одного разу", () => {
    const loan = { due: new Date(2026, 8, 15), returnedAt: null, renewed: true };
    expect(() => lib.renewLoan(loan, today)).toThrow("Книгу можна продовжити лише один раз");
  });

  test("помилка: не можна продовжити повернуту книгу", () => {
    const loan = { due: new Date(2026, 8, 15), returnedAt: new Date(2026, 8, 12), renewed: false };
    expect(() => lib.renewLoan(loan, today)).toThrow("Не можна продовжити повернуту книгу");
  });

  test("помилка: не можна продовжити прострочену книгу", () => {
    const lateToday = new Date(2026, 8, 20); // Сьогодні вже 20-те
    const loan = { due: new Date(2026, 8, 15), returnedAt: null, renewed: false };
    expect(() => lib.renewLoan(loan, lateToday)).toThrow("Не можна продовжити прострочену книгу");
  });
});