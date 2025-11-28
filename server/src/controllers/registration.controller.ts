import { Elysia, t } from "elysia";
import { Prisma } from "@prisma/client";
import { prisma } from "../index";
import { uploadImage, deleteImage } from "../utils/imagekit";

export const registrationController = new Elysia({ prefix: "/registrations" })
  .post(
    "/create",
    async ({ body, set }) => {
      const {
        name,
        roll,
        phone,
        email,
        department,
        year,
        questions,
        eventSlug,
        eventTitle,
        transactionId,
        amount,
      } = body;

      const normalizedEmail = email.toLowerCase();

      // Check existing registration
      const existingRegistration = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          eventSlug,
        },
      });

      if (existingRegistration) {
        set.status = 400;
        return `You have already registered for this event with the email ${normalizedEmail}.`;
      }

      // Check existing transaction
      const existingTransaction = await prisma.payment.findFirst({
        where: {
          transactionId,
        },
      });

      if (existingTransaction) {
        set.status = 400;
        return `This transaction ID (${transactionId}) has already been used.`;
      }

      try {
        const result = await prisma.$transaction(async (tx: any) => {
          const user = await tx.user.create({
            data: {
              name,
              roll,
              phone,
              email: normalizedEmail,
              department,
              year,
              questions,
              eventSlug,
              eventTitle,
            },
          });

          const payment = await tx.payment.create({
            data: {
              userId: user.id,
              transactionId,
              paymentScreenshotUrl: "",
              paymentScreenshotStorageId: "",
              eventSlug,
              eventTitle,
              amount,
              status: "pending",
            },
          });

          return { user, payment };
        });

        return {
          success: true,
          userId: result.user.id,
          paymentId: result.payment.id,
        };
      } catch (e) {
        console.error(e);
        set.status = 500;
        return "Registration failed";
      }
    },
    {
      body: t.Object({
        name: t.String(),
        roll: t.String(),
        phone: t.String(),
        email: t.String(),
        department: t.String(),
        year: t.String(),
        questions: t.String(),
        eventSlug: t.String(),
        eventTitle: t.String(),
        transactionId: t.String(),
        amount: t.Number(),
      }),
    }
  )
  .post(
    "/update-payment",
    async ({ body, set }) => {
      const { paymentId, paymentScreenshotUrl, paymentScreenshotStorageId } =
        body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        set.status = 404;
        return "Payment record not found";
      }

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentScreenshotUrl,
          paymentScreenshotStorageId,
        },
      });

      return {
        success: true,
        message: "Registration successful! Your payment is pending verification.",
      };
    },
    {
      body: t.Object({
        paymentId: t.String(),
        paymentScreenshotUrl: t.String(),
        paymentScreenshotStorageId: t.String(),
      }),
    }
  )
  .delete(
    "/delete",
    async ({ body, set }) => {
      const { userId, paymentId } = body;

      try {
        // Prisma cascade delete will handle payment if user is deleted, 
        // but let's be explicit or rely on cascade.
        // Schema says: user User @relation(fields: [userId], references: [id], onDelete: Cascade)
        // So deleting user deletes payment.
        
        await prisma.user.delete({
          where: { id: userId },
        });

        return { success: true };
      } catch (e) {
        set.status = 500;
        return "Failed to delete registration";
      }
    },
    {
      body: t.Object({
        userId: t.String(),
        paymentId: t.String(),
      }),
    }
  )
  .get(
    "/event/:eventSlug",
    async ({ params }) => {
      const { eventSlug } = params;
      const users = await prisma.user.findMany({
        where: { eventSlug },
        include: { payment: true },
      });
      return users;
    },
    {
      params: t.Object({
        eventSlug: t.String(),
      }),
    }
  )
  .get(
    "/user",
    async ({ query }) => {
      const { email, eventSlug } = query;
      if (!email || !eventSlug) return null;

      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          eventSlug,
        },
        include: { payment: true },
      });

      return user;
    },
    {
      query: t.Object({
        email: t.String(),
        eventSlug: t.String(),
      }),
    }
  )
  .get(
    "/check-email",
    async ({ query }) => {
      const { email, eventSlug } = query;
      if (!email || email.length < 5 || !eventSlug) {
        return { isRegistered: false };
      }

      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          eventSlug,
        },
      });

      return {
        isRegistered: !!user,
        registrationDate: user?.registeredAt.getTime(),
      };
    },
    {
      query: t.Object({
        email: t.String(),
        eventSlug: t.String(),
      }),
    }
  )
  // This endpoint combines registration and image upload (replacing actions.ts logic)
  // However, handling file upload in Elysia might be different.
  // For now, I'll assume the client sends base64 or FormData.
  // The original action received base64.
  .post(
    "/register-with-image",
    async ({ body, set }) => {
      const {
        name,
        roll,
        phone,
        email,
        department,
        year,
        questions,
        eventSlug,
        eventTitle,
        transactionId,
        amount,
        imageBuffer, // base64
        fileName,
      } = body;

      // 1. Create Pending Registration
      // We can reuse the logic or call the internal function if we extracted it.
      // For simplicity, I'll duplicate the checks here or call the endpoint logic if I refactor.
      // I'll just write the logic here.

      const normalizedEmail = email.toLowerCase();
       // Check existing registration
       const existingRegistration = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          eventSlug,
        },
      });

      if (existingRegistration) {
        set.status = 400;
        return `You have already registered for this event with the email ${normalizedEmail}.`;
      }

      // Check existing transaction
      const existingTransaction = await prisma.payment.findFirst({
        where: {
          transactionId,
        },
      });

      if (existingTransaction) {
        set.status = 400;
        return `This transaction ID (${transactionId}) has already been used.`;
      }

      let userId: string | undefined;
      let paymentId: string | undefined;
      let fileId: string | undefined;

      try {
        // Create DB records
        const result = await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
              data: {
                name,
                roll,
                phone,
                email: normalizedEmail,
                department,
                year,
                questions,
                eventSlug,
                eventTitle,
              },
            });
  
            const payment = await tx.payment.create({
              data: {
                userId: user.id,
                transactionId,
                paymentScreenshotUrl: "",
                paymentScreenshotStorageId: "",
                eventSlug,
                eventTitle,
                amount,
                status: "pending",
              },
            });
  
            return { user, payment };
          });
        
        userId = result.user.id;
        paymentId = result.payment.id;

        // Upload Image
        const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, "-")}`;
        const uploadResult = await uploadImage(
            imageBuffer,
            uniqueFileName,
            `/event-registrations/${eventSlug}`,
            ["event-registration", eventSlug]
        );
        
        fileId = uploadResult.fileId;

        // Update Payment with Image
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                paymentScreenshotUrl: uploadResult.url,
                paymentScreenshotStorageId: uploadResult.fileId
            }
        });

        return {
            success: true,
            message: "Registration successful! Your payment is pending verification."
        };

      } catch (e: any) {
         // Cleanup
         if (fileId) await deleteImage(fileId);
         if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => {});
         set.status = 500;
         return (e as Error).message || "Registration failed";
      }
    },
    {
      body: t.Object({
        name: t.String(),
        roll: t.String(),
        phone: t.String(),
        email: t.String(),
        department: t.String(),
        year: t.String(),
        questions: t.String(),
        eventSlug: t.String(),
        eventTitle: t.String(),
        transactionId: t.String(),
        amount: t.Number(),
        imageBuffer: t.String(),
        fileName: t.String(),
      }),
    }
  );
