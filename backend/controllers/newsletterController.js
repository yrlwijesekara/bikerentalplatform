import Newsletter from "../model/newsletter.js";

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
