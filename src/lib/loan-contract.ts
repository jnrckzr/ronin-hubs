import { format as fmtDate, parseISO } from "date-fns";

/* ─────────────────────────────────────────────────────────────────────────
   Loan contract PDF generator (client-side, uses jsPDF).
   Install once:  bun add jspdf
   Save as:       src/lib/loan-contract.ts
────────────────────────────────────────────────────────────────────────── */

export interface ContractData {
  loanId?: string;
  lenderName: string;
  borrowerName: string;
  guarantorName?: string | null;
  capital: number;
  rate: number; // decimal, e.g. 0.20 = 20%
  termDays: number;
  dateBorrowed: string; // yyyy-MM-dd
  dueDate: string; // yyyy-MM-dd
  notes?: string | null;
  rateSchedule: { days: number; rate: number }[];
  getRate: (days: number) => number;
}

/* ── helpers ── */
const r2 = (n: number): number => Math.round(n * 100) / 100;

const php = (n: number): string =>
  "PHP " + r2(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pct = (n: number): string => `${(n * 100).toFixed(2)}%`;

const longDate = (s: string): string => fmtDate(parseISO(s), "MMMM d, yyyy");

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function belowThousand(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(`${ONES[h] ?? ""} hundred`);
  if (rest) {
    if (rest < 20) {
      parts.push(ONES[rest] ?? "");
    } else {
      const t = TENS[Math.floor(rest / 10)] ?? "";
      const o = ONES[rest % 10] ?? "";
      parts.push(o ? `${t}-${o}` : t);
    }
  }
  return parts.join(" ");
}

function intToWords(n: number): string {
  if (n === 0) return "zero";
  const scales: [number, string][] = [
    [1_000_000_000, "billion"],
    [1_000_000, "million"],
    [1_000, "thousand"],
  ];
  const parts: string[] = [];
  let rem = n;
  for (const [v, name] of scales) {
    if (rem >= v) {
      parts.push(`${belowThousand(Math.floor(rem / v))} ${name}`);
      rem %= v;
    }
  }
  if (rem) parts.push(belowThousand(rem));
  return parts.join(" ");
}

export function pesosInWords(amount: number): string {
  const total = Math.round(amount * 100);
  const pesos = Math.floor(total / 100);
  const cents = total % 100;
  const words = intToWords(pesos);
  const cap = words.charAt(0).toUpperCase() + words.slice(1);
  return `${cap} pesos${cents ? ` and ${String(cents).padStart(2, "0")}/100` : " only"}`;
}

/* ── main ── */
export async function downloadLoanContract(d: ContractData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const M = 20;
  const CW = PAGE_W - M * 2;
  let y = M;

  const interest = r2(d.capital * d.rate);
  const totalDue = r2(d.capital + interest);
  const ref = d.loanId ? d.loanId.slice(0, 8).toUpperCase() : "DRAFT";
  const hasGuarantor = !!d.guarantorName && d.guarantorName.trim().length > 0;

  // Worked late-payment example (5 days after the due date)
  const lateDays = 5;
  const exRate = Math.max(d.rate, d.getRate(d.termDays + lateDays));
  const exInterest = r2(d.capital * exRate);
  const exTotal = r2(d.capital + exInterest);

  const ensure = (h: number): void => {
    if (y + h > PAGE_H - 22) {
      doc.addPage();
      y = M;
    }
  };

  const write = (
    str: string,
    o: { size?: number; bold?: boolean; x?: number; gap?: number } = {}
  ): void => {
    const size = o.size ?? 10.5;
    const lh = size * 0.5;
    const x = M + (o.x ?? 0);
    doc.setFont("helvetica", o.bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(str, CW - (o.x ?? 0)) as string[];
    for (const line of lines) {
      ensure(lh);
      y += lh;
      doc.text(line, x, y);
    }
    y += o.gap ?? 2;
  };

  const heading = (str: string): void => {
    ensure(16);
    y += 3;
    write(str, { bold: true, size: 11, gap: 1 });
  };

  const row = (label: string, value: string): void => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const lines = doc.splitTextToSize(value, CW - 60) as string[];
    const h = Math.max(1, lines.length) * 5.2 + 2.5;
    ensure(h);
    doc.setFont("helvetica", "bold");
    doc.text(label, M + 1, y + 5.5);
    doc.setFont("helvetica", "normal");
    lines.forEach((l, i) => doc.text(l, M + 60, y + 5.5 + i * 5.2));
    y += h;
    doc.setDrawColor(210);
    doc.setLineWidth(0.2);
    doc.line(M, y, M + CW, y);
  };

  const sigBlock = (x: number, w: number, name: string, role: string): void => {
    doc.setDrawColor(60);
    doc.setLineWidth(0.3);
    doc.line(x, y, x + w, y);
    if (name) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(name, x, y + 5);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(role, x, y + (name ? 9.5 : 5));
  };

  /* ── Title ── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  y += 6;
  doc.text("LOAN AGREEMENT", PAGE_W / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`(Promissory Note)   Ref. No. ${ref}`, PAGE_W / 2, y, { align: "center" });
  y += 8;

  /* ── Parties ── */
  write(`This Loan Agreement is made on ${longDate(d.dateBorrowed)} by and between:`, { gap: 4 });

  write(`${d.lenderName}, hereinafter called the "Lender";`, { bold: true, gap: 1 });
  write("and", { gap: 1 });
  write(`${d.borrowerName}, hereinafter called the "Borrower",`, { bold: true, gap: 1 });
  write("Address: ______________________________________   Contact No.: ____________________", {
    size: 9.5,
    gap: 1,
  });
  write("Valid ID Type / No.: ____________________________________________________", {
    size: 9.5,
    gap: 3,
  });

  if (hasGuarantor) {
    write(`with ${d.guarantorName!.trim()}, hereinafter called the "Guarantor", who joins in this Agreement,`, {
      bold: true,
      gap: 1,
    });
    write("Address: ______________________________________   Contact No.: ____________________", {
      size: 9.5,
      gap: 3,
    });
  }

  write("The parties agree to the following terms:", { gap: 3 });

  /* ── Loan details ── */
  heading("LOAN DETAILS");
  doc.setDrawColor(210);
  doc.setLineWidth(0.2);
  doc.line(M, y, M + CW, y);
  row("Principal amount", `${php(d.capital)}  (${pesosInWords(d.capital)})`);
  row("Date of loan", longDate(d.dateBorrowed));
  row("Term", `${d.termDays} day${d.termDays === 1 ? "" : "s"}`);
  row("Due date", longDate(d.dueDate));
  row("Interest rate", `${pct(d.rate)} for the full term`);
  row("Interest amount", php(interest));
  row("Total amount due", `${php(totalDue)}  (${pesosInWords(totalDue)})`);
  row("Lender", d.lenderName);
  row("Borrower", d.borrowerName);
  if (hasGuarantor) row("Guarantor", d.guarantorName!.trim());
  y += 2;

  /* ── Clauses ── */
  let n = 1;
  const clause = (title: string, body: string): void => {
    heading(`${n}. ${title}`);
    write(body, { gap: 2 });
    n += 1;
  };

  clause(
    "Loan and Receipt",
    `The Lender lends to the Borrower, and the Borrower acknowledges receipt of, the principal amount of ${php(d.capital)} (${pesosInWords(d.capital)}) on ${longDate(d.dateBorrowed)}.`
  );

  clause(
    "Term and Due Date",
    `The Borrower shall pay the full amount due on or before ${longDate(d.dueDate)}, which is ${d.termDays} day${d.termDays === 1 ? "" : "s"} from the date of the loan.`
  );

  clause(
    "Interest",
    `The loan earns interest at ${pct(d.rate)} for the full term, equal to ${php(interest)}. The total amount due at the end of the term is therefore ${php(totalDue)}.`
  );

  clause(
    "Manner of Payment",
    "Payment may be made in one lump sum or in installments accepted by the Lender. Each installment is applied first to the interest and then to the principal. The Lender shall acknowledge every payment received."
  );

  clause(
    "Late Payment",
    `If the loan is not fully paid on or before the due date, the interest rate is recomputed from the date of the loan based on the actual number of days the loan stays unpaid, following the Rate Schedule in Schedule A. The additional interest accrues automatically for every day after the due date and is payable together with the principal. For example, if this loan is paid ${lateDays} days after the due date (day ${d.termDays + lateDays}), the interest rate becomes ${pct(exRate)} (${php(exInterest)}) and the total amount due becomes ${php(exTotal)}.`
  );

  clause(
    "Renewal",
    `With the Lender's consent, the Borrower may extend the loan for another term by paying the interest of ${php(interest)} on or before the due date. The principal then remains outstanding for the new term under the same terms of this Agreement.`
  );

  if (hasGuarantor) {
    clause(
      "Guarantor",
      `The Guarantor, ${d.guarantorName!.trim()}, binds himself/herself to the Lender as solidary obligor with the Borrower for the full amount due under this Agreement, including late-payment interest. The Lender may demand payment from the Guarantor if the Borrower fails to pay on the due date.`
    );
  }

  clause(
    "Default and Collection",
    "Failure to pay the amount due after the due date is a default. In case of default, the Lender may demand immediate payment of the whole outstanding balance, and the Borrower (and the Guarantor, if any) shall also be liable for reasonable costs of collection."
  );

  clause(
    "Governing Law",
    "This Agreement is governed by the laws of the Republic of the Philippines. Any dispute shall first be settled amicably between the parties."
  );

  if (d.notes && d.notes.trim()) {
    clause("Additional Notes", d.notes.trim());
  }

  /* ── Signatures ── */
  ensure(60);
  y += 4;
  write("IN WITNESS WHEREOF, the parties have signed this Agreement on the date first written above.", {
    gap: 2,
  });

  ensure(34);
  y += 16;
  sigBlock(M, 75, d.lenderName, "Lender");
  sigBlock(M + 95, 75, d.borrowerName, "Borrower");
  y += 14;

  if (hasGuarantor) {
    ensure(30);
    y += 12;
    sigBlock(M, 75, d.guarantorName!.trim(), "Guarantor");
    y += 14;
  }

  ensure(30);
  y += 12;
  sigBlock(M, 75, "", "Witness 1 (Name & Signature)");
  sigBlock(M + 95, 75, "", "Witness 2 (Name & Signature)");
  y += 12;

  /* ── Schedule A ── */
  ensure(50);
  y += 6;
  heading("SCHEDULE A — RATE SCHEDULE");
  write(
    "Interest rate according to the total number of days the loan is outstanding, counted from the date of the loan:",
    { size: 9.5, gap: 3 }
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const cols = 4;
  const rowsNeeded = Math.ceil(d.rateSchedule.length / cols);
  ensure(rowsNeeded * 6 + 16);
  d.rateSchedule.forEach((t, i) => {
    const col = i % cols;
    const r = Math.floor(i / cols);
    doc.text(`${t.days} days: ${pct(t.rate)}`, M + col * 42, y + 4 + r * 6);
  });
  y += rowsNeeded * 6 + 4;
  write(
    "For a number of days between two listed periods, the rate is computed proportionally. Beyond the last listed period, the rate keeps increasing at the same daily pace as between the last two listed periods.",
    { size: 9, gap: 2 }
  );

  /* ── Footer with page numbers ── */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Loan Agreement ${ref}  -  Page ${i} of ${pages}`, PAGE_W / 2, PAGE_H - 10, {
      align: "center",
    });
    doc.setTextColor(0);
  }

  const slug = d.borrowerName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "borrower";
  doc.save(`Loan-Agreement-${slug}-${d.dateBorrowed}.pdf`);
}
