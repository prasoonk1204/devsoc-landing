import { Elysia, t } from "elysia";
import { prisma } from "../index";

export const settingController = new Elysia({ prefix: "/settings" })
  .get(
    "/:key",
    async ({ params }) => {
      const { key } = params;
      const setting = await prisma.setting.findUnique({
        where: { key },
      });

      if (!setting) return null;

      try {
        return {
          ...setting,
          value: JSON.parse(setting.value),
        };
      } catch {
        return setting;
      }
    },
    {
      params: t.Object({
        key: t.String(),
      }),
    }
  )
  .get("/", async () => {
    const settings = await prisma.setting.findMany();
    return settings.map((setting: { key: string; value: string; description: string | null; updatedAt: Date; updatedBy: string | null; id: string }) => {
      try {
        return {
          ...setting,
          value: JSON.parse(setting.value),
        };
      } catch {
        return setting;
      }
    });
  })
  .post(
    "/",
    async ({ body }) => {
      const { key, value, description, updatedBy } = body;

      const existing = await prisma.setting.findUnique({
        where: { key },
      });

      if (existing) {
        await prisma.setting.update({
          where: { id: existing.id },
          data: {
            value,
            description,
            updatedBy,
          },
        });
        return {
          success: true,
          message: `Setting '${key}' updated successfully`,
        };
      } else {
        await prisma.setting.create({
          data: {
            key,
            value,
            description,
            updatedBy,
          },
        });
        return {
          success: true,
          message: `Setting '${key}' created successfully`,
        };
      }
    },
    {
      body: t.Object({
        key: t.String(),
        value: t.String(),
        description: t.Optional(t.String()),
        updatedBy: t.Optional(t.String()),
      }),
    }
  )
  .delete(
    "/:key",
    async ({ params, set }) => {
      const { key } = params;
      try {
        await prisma.setting.delete({
          where: { key },
        });
        return {
          success: true,
          message: `Setting '${key}' deleted successfully`,
        };
      } catch {
        set.status = 404;
        return `Setting '${key}' not found`;
      }
    },
    {
      params: t.Object({
        key: t.String(),
      }),
    }
  )
  .get(
    "/payment-settings/:eventSlug",
    async ({ params }) => {
      const { eventSlug } = params;
      
      // Try event specific
      let setting = await prisma.setting.findUnique({
        where: { key: `payment_${eventSlug}` },
      });

      if (setting) {
        try {
          return JSON.parse(setting.value);
        } catch {}
      }

      // Fallback
      setting = await prisma.setting.findUnique({
        where: { key: "payment_default" },
      });

      if (setting) {
        try {
          return JSON.parse(setting.value);
        } catch {}
      }

      return null;
    },
    {
        params: t.Object({
            eventSlug: t.Optional(t.String())
        })
    }
  )
  .get("/community-links", async () => {
    const setting = await prisma.setting.findUnique({
      where: { key: "community_links" },
    });

    if (!setting) {
      return { whatsapp: null, discord: null };
    }

    try {
      const parsed = JSON.parse(setting.value);
      return {
        whatsapp: parsed.whatsapp || null,
        discord: parsed.discord || null,
      };
    } catch {
      return { whatsapp: null, discord: null };
    }
  });
