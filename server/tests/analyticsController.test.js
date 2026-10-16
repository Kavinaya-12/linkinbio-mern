const test = require("node:test");
const assert = require("node:assert/strict");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const User = require("../models/User");
const { getAnalytics } = require("../controllers/userController");

const invokeAnalytics = async () => {
  const req = { userId: "owner-id" };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
  let forwardedError;
  await getAnalytics(req, res, (error) => { forwardedError = error; });
  return { res, forwardedError };
};

const withAnalyticsData = async ({ views, clickEvents, links }, callback) => {
  const originalCountDocuments = AnalyticsEvent.countDocuments;
  const originalFindEvents = AnalyticsEvent.find;
  const originalFindUser = User.findById;
  AnalyticsEvent.countDocuments = async ({ type }) => type === "view" ? views : clickEvents.length;
  AnalyticsEvent.find = () => ({
    select: () => ({ lean: async () => clickEvents }),
  });
  User.findById = () => ({
    select: () => ({ lean: async () => ({ links }) }),
  });
  try {
    await callback();
  } finally {
    AnalyticsEvent.countDocuments = originalCountDocuments;
    AnalyticsEvent.find = originalFindEvents;
    User.findById = originalFindUser;
  }
};

test("analytics returns the existing empty response shape when there is no activity", async () => {
  await withAnalyticsData({ views: 0, clickEvents: [], links: [] }, async () => {
    const { res, forwardedError } = await invokeAnalytics();
    assert.equal(forwardedError, undefined);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, { views: 0, clicks: 0, links: [], mostClickedLink: null });
  });
});

test("analytics aggregates click events against the owner's current links", async () => {
  const links = [
    { title: "Portfolio", url: "https://example.com/portfolio" },
    { title: "Writing", url: "https://example.com/writing" },
  ];
  const clickEvents = [
    { linkUrl: links[0].url },
    { linkUrl: links[0].url },
    { linkUrl: links[1].url },
  ];
  await withAnalyticsData({ views: 5, clickEvents, links }, async () => {
    const { res, forwardedError } = await invokeAnalytics();
    assert.equal(forwardedError, undefined);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, {
      views: 5,
      clicks: 3,
      links: [
        { ...links[0], clicks: 2 },
        { ...links[1], clicks: 1 },
      ],
      mostClickedLink: { ...links[0], clicks: 2 },
    });
  });
});
