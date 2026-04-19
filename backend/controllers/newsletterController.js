import Newsletter from "../model/newsletter.js";
import { checkAdmin } from "./usercontroller.js";

export async function subscribeNewsletter(req, res) {
  try {
    const email = req.body?.email?.trim().toLowerCase();
    const audienceType = req.body?.audienceType === "business" ? "business" : "general";
    const source = req.body?.source?.trim() || "footer";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existing = await Newsletter.findOne({ email });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.audienceType = audienceType;
        existing.source = source;
        await existing.save();

        return res.status(200).json({ message: "Subscription reactivated successfully" });
      }

      return res.status(409).json({ message: "Email is already subscribed" });
    }

    await Newsletter.create({ email, audienceType, source });

    return res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email is already subscribed" });
    }

    console.error("Newsletter subscribe error:", error);
    return res.status(500).json({ message: "Failed to subscribe" });
  }
}

function escapeCsvValue(value = "") {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes("\n") || str.includes("\"")) {
    return `"${str.replaceAll("\"", "\"\"")}"`;
  }
  return str;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export async function getNewsletterSubscribersAdmin(req, res) {
  try {
    if (!checkAdmin(req.user)) {
      return res.status(403).json({ message: "Access denied. Admin only endpoint." });
    }

    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim()?.toLowerCase() || "all";

    const filter = {};

    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const [subscribers, totalSubscribers] = await Promise.all([
      Newsletter.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Newsletter.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Newsletter subscribers fetched successfully",
      subscribers,
      pagination: {
        page,
        limit,
        totalSubscribers,
        totalPages: Math.max(1, Math.ceil(totalSubscribers / limit)),
      },
    });
  } catch (error) {
    console.error("Get newsletter subscribers error:", error);
    return res.status(500).json({ message: "Failed to fetch subscribers" });
  }
}

export async function exportNewsletterSubscribersAdmin(req, res) {
  try {
    if (!checkAdmin(req.user)) {
      return res.status(403).json({ message: "Access denied. Admin only endpoint." });
    }

    const status = req.query.status?.trim()?.toLowerCase() || "all";
    const filter = {};

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const subscribers = await Newsletter.find(filter).sort({ createdAt: -1 }).lean();

    const header = ["No", "Email", "Audience Type", "Status", "Source", "Created At", "Updated At"];
    const rows = subscribers.map((item, index) => [
      index + 1,
      item.email,
      item.audienceType || "general",
      item.isActive ? "active" : "inactive",
      item.source || "footer",
      item.createdAt ? new Date(item.createdAt).toLocaleString("en-GB") : "N/A",
      item.updatedAt ? new Date(item.updatedAt).toLocaleString("en-GB") : "N/A",
    ]);

    const csvLines = [header, ...rows].map((line) => line.map((cell) => escapeCsvValue(cell)).join(","));
    const csvContent = csvLines.join("\n");
    const filename = `newsletter_subscribers_${status}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export newsletter subscribers error:", error);
    return res.status(500).json({ message: "Failed to export subscribers" });
  }
}
