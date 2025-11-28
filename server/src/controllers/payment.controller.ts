import { Elysia, t } from "elysia";
import { prisma } from "../index";

export const paymentController = new Elysia({ prefix: "/payments" })
  .post(
    "/update-status",
    async ({ body, set }) => {
      const { paymentId, status, verifiedBy } = body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        set.status = 404;
        return "Payment not found";
      }

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          verifiedAt: status === "verified" ? new Date() : null,
          verifiedBy,
        },
      });

      return {
        success: true,
        message: `Payment ${status} successfully`,
      };
    },
    {
      body: t.Object({
        paymentId: t.String(),
        status: t.String(),
        verifiedBy: t.Optional(t.String()),
      }),
    }
  )
  .get("/pending", async () => {
    const payments = await prisma.payment.findMany({
      where: { status: "pending" },
      include: { user: true },
    });
    return payments;
  });
