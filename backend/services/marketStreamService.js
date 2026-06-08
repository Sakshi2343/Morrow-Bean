import { EventEmitter } from "events";

const marketEvents = new EventEmitter();
marketEvents.setMaxListeners(100);

const broadcastMarketEvent = (event, payload) => {
  marketEvents.emit("market-event", {
    event,
    payload,
    sentAt: new Date().toISOString(),
  });
};

const attachMarketStream = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const send = (entry) => {
    res.write(`event: ${entry.event}\n`);
    res.write(`data: ${JSON.stringify(entry.payload)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  const handler = (entry) => send(entry);
  marketEvents.on("market-event", handler);

  send({
    event: "stream-ready",
    payload: { ok: true },
  });

  req.on("close", () => {
    clearInterval(heartbeat);
    marketEvents.off("market-event", handler);
    res.end();
  });
};

export { attachMarketStream, broadcastMarketEvent };
