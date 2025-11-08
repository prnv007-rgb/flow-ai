// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// --- Interfaces (Same as your code) ---
interface LlmValue<T> {
  value: T;
}

interface LlmLineItem {
  description: LlmValue<string>;
  quantity: LlmValue<number>;
  unitPrice: LlmValue<number>;
  totalPrice: LlmValue<number>;
  Sachkonto?: LlmValue<string>;
}

interface LineItemsWrapper {
  items: {
    value: LlmLineItem[];
  };
}

interface JsonDoc {
  _id: string;
  status: string;
  extractedData: {
    llmData: {
      invoice: {
        value: {
          invoiceId: LlmValue<string>;
          invoiceDate: LlmValue<string>;
        };
      };
      vendor: {
        value: {
          vendorName: LlmValue<string>;
        };
      };
      customer: {
        value: {
          customerName: LlmValue<string | null>;
        };
      };
      payment: {
        value: {
          dueDate: LlmValue<string | null>;
        };
      };
      summary: {
        value: {
          invoiceTotal: LlmValue<number>;
        };
      };
      lineItems: {
        value: LineItemsWrapper;
      };
    };
  };
}

function parseSafeDate(dateString: string | null | undefined): Date | null {
  if (!dateString) {
    return null;
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}
// --- End of interfaces ---

async function main() {
  console.log('Starting seed...');

  const jsonPath = path.join(
    process.cwd(),
    '..',
    '..',
    'data',
    'Analytics_Test_Data.json',
  );
  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const jsonData: JsonDoc[] = JSON.parse(fileData);

  let upsertedCount = 0;
  let skippedCount = 0;

  for (const doc of jsonData) {
    try {
      const llm = doc.extractedData.llmData;

      // --- Validation (Same as your code) ---
      if (
        !llm ||
        !llm.invoice?.value?.invoiceId?.value ||
        llm.summary?.value?.invoiceTotal?.value === undefined ||
        !llm.vendor?.value?.vendorName?.value
      ) {
        console.warn(
          `Skipping record ${doc._id}: Missing core invoice, summary, or vendor data.`,
        );
        skippedCount++;
        continue;
      }

      const lineItemsArray = llm.lineItems?.value?.items?.value;
      if (!lineItemsArray || !Array.isArray(lineItemsArray)) {
        console.warn(
          `Skipping record ${doc._id}: Line items are missing or not an array.`,
        );
        skippedCount++;
        continue;
      }
      // --- End Validation ---

      // 1. Upsert Vendor
      const vendorName = llm.vendor.value.vendorName.value;
      const vendor = await prisma.vendor.upsert({
        where: { name: vendorName },
        update: {},
        create: { name: vendorName },
      });

      // 2. Prepare Invoice data
      const invoiceId = doc._id; // This is the TRUE unique ID
      const invoiceNumber = llm.invoice.value.invoiceId.value;
      const invoiceDate = new Date(llm.invoice.value.invoiceDate.value);
      const invoiceTotal = llm.summary.value.invoiceTotal.value;
      const invoiceStatus = doc.status;
      const customerName = llm.customer?.value?.customerName?.value ?? null;
      const dueDate = parseSafeDate(llm.payment?.value?.dueDate?.value);

      // Prepare line items data
      const lineItemsData = lineItemsArray.map((item) => ({
        description: item.description.value,
        quantity: item.quantity.value,
        unitPrice: item.unitPrice.value,
        totalPrice: item.totalPrice.value,
        category: item.Sachkonto?.value ?? null,
      }));

      // 3. *** THIS IS THE FIX ***
      // Use upsert to make the script idempotent (re-runnable)
      await prisma.invoice.upsert({
        where: { id: invoiceId }, // Use the true primary key
        update: {
          // Update all fields in case data changed
          invoiceNumber: invoiceNumber,
          date: invoiceDate,
          amount: invoiceTotal,
          status: invoiceStatus,
          customerName: customerName,
          vendorId: vendor.id,
          // For relations, we clear them and add the new ones.
          lineItems: {
            deleteMany: {}, // Delete all existing line items
            create: lineItemsData, // Create new ones
          },
          payment: {
            // Upsert the one-to-one payment relation
            upsert: {
              create: { date: dueDate, amount: invoiceTotal },
              update: { date: dueDate, amount: invoiceTotal },
            },
          },
        },
        create: {
          // Create new invoice
          id: invoiceId,
          invoiceNumber: invoiceNumber,
          date: invoiceDate,
          amount: invoiceTotal,
          status: invoiceStatus,
          customerName: customerName,
          vendorId: vendor.id,
          lineItems: {
            create: lineItemsData,
          },
          payment: {
            create: {
              date: dueDate,
              amount: invoiceTotal,
            },
          },
        },
      });

      upsertedCount++;
      console.log(`Successfully upserted invoice ${invoiceNumber}`);
    } catch (error: any) {
      console.error(
        `Failed to process record ${doc._id}: ${error.message}`,
      );
      skippedCount++;
    }
  }

  console.log('Seeding finished.');
  console.log(`Upserted ${upsertedCount} invoices.`);
  console.log(`Skipped ${skippedCount} invalid records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });