/**
 * Облік видачі книг у бібліотеці коледжу.
 * Вимоги — у README.md, розділ «Правила бібліотеки».
 */

const LOAN_DAYS = 14;
const FINE_PER_DAY = 5;
const MAX_FINE = 100;
const MAX_ACTIVE = 3;
const CARD_RE = /^(KP|ZV)-(\d{4})\/(\d{2})$/;

function isValidCard(card) {
  return CARD_RE.test(card);
}

function dueDate(issueDate, days = LOAN_DAYS) {
  const newDate = new Date(issueDate);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function calculateFine(due, returnedAt) {
  // Різниця в мілісекундах, поділена на добу. Round рятує від зсуву
  const msPerDay = 86400000;
  const late = Math.round((returnedAt - due) / msPerDay);

  if (late <= 0) return 0;
  return Math.min(late * FINE_PER_DAY, MAX_FINE);
}

function groupByReader(loans) {
  const result = {};
  for (const loan of loans) {
    (result[loan.readerId] ||= []).push(loan);
  }
  return result;
}

function canBorrow(reader, loans) {
  const byReader = groupByReader(loans);
  // Якщо історії немає, масив порожній []
  const history = byReader[reader.id] || [];
  const active = history.filter((l) => !l.returnedAt);
  return reader.active && active.length < MAX_ACTIVE;
}

function issueBook(loans, reader, bookId, issueDate) {
  if (!isValidCard(reader.card)) {
    throw new Error("Некоректний номер читацького квитка");
  }
  if (!canBorrow(reader, loans)) {
    throw new Error("Видачу заборонено");
  }
  const loan = {
    readerId: reader.id,
    bookId,
    issuedAt: issueDate,
    due: dueDate(issueDate),
    returnedAt: null,
  };
  loans.push(loan);
  return loan;
}

function returnBook(loan, returnedAt) {
  loan.returnedAt = returnedAt;
  return calculateFine(loan.due, returnedAt);
}

function renewLoan(loan, today) {
  if (loan.returnedAt) {
    throw new Error("Не можна продовжити повернуту книгу");
  }
  if (today > loan.due) {
    throw new Error("Не можна продовжити прострочену книгу");
  }
  if (loan.renewed) {
    throw new Error("Книгу можна продовжити лише один раз");
  }

  return {
    ...loan,
    due: dueDate(loan.due, 7),
    renewed: true
  };
}

module.exports = {
  LOAN_DAYS, FINE_PER_DAY, MAX_FINE, MAX_ACTIVE,
  isValidCard, dueDate, calculateFine, canBorrow, issueBook, returnBook, renewLoan,
};
