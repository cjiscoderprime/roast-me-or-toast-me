import {Redis} from "@upstash/redis";
import {Ratelimit} from "@upstash/ratelimit";

const redis = Redis.fromEnv();

const visitorLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "15 m"),
    prefix: "roast-toast:visitor",
    analytics: false,
});

const globalLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(500, "1 d"),
    prefix: "roast-toast:global",
    analytics: false,
});

export async function rateLimiter(req, res, next) {
    console.log("RATE LIMITER EXECUTED");
    try{
        const ip = req.ip || req.socket.remoteAddress || "unknown";

        const visitor = await visitorLimiter.limit(ip);
        console.log("Visitor IP:", ip);
        console.log("Rate limit result:", visitor);

        if(!visitor.success) {
            return res.status(429).json({
                error: "You've had a good run. Cool down so that I can keep deploying free tier.",
            });
        }

        const global = await globalLimiter.limit("all-visitors");
        
        if(!global.success) {
            return res.status(429).json({
                error: "Today's quota has been reached. Bummer but I got mouths to feed.",
            });
        }

        res.setHeader("RateLimit-Limit", visitor.limit);
        res.setHeader("RateLimit-Remaining", visitor.remaining);

        next();
    } catch (error) {
        console.error("Redis rate limiter failed: ", error.message);

        return res.status(503).json({
            error: "The service is temporarily unavailable.",
        });
    }
 }