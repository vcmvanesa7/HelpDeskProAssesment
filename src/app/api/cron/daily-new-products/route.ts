import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Product } from "@/schemas/products/product.schema";
import { User } from "@/schemas/user.schema";
import { sendEmail } from "@/lib/mailer";

export async function GET(req: Request) {
  // SECURITY: allow only CRON
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connect();

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1) NEW PRODUCTS (last 24 hours)
    const newProducts = await Product.find({
      createdAt: { $gte: yesterday },
    }).limit(10);

    if (newProducts.length === 0) {
      return NextResponse.json({ message: "No new products today" });
    }

    // 2) GET USERS
    const users = await User.find({});

    // 3) SEND EMAIL TO ALL USERS
    for (const user of users) {
      const html = `
        <h2 style="font-family:sans-serif;">
          New arrivals in the last 24 hours
        </h2>

        ${newProducts
          .map(
            (p) => `
              <div style="margin-bottom:20px;">
                ${
                  p.images?.[0]?.url
                    ? `<img src="${p.images[0].url}" width="220" style="border-radius:8px;" />`
                    : ""
                }
                <h3>${p.title}</h3>
                <p><strong>$${p.price}</strong></p>
              </div>
            `
          )
          .join("")}

        <p>
          <a href="${process.env.NEXT_PUBLIC_URL}/products"
             style="padding:10px 20px;background:black;color:white;text-decoration:none;border-radius:6px;">
            Shop now
          </a>
        </p>
      `;

      // CORRECT FORMAT
      await sendEmail(user.email, " New KOI Drops Today!", html);
    }

    return NextResponse.json({
      ok: true,
      sentTo: users.length,
      products: newProducts.length,
    });
  } catch (error) {
    console.error("[CRON FAILED]", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
