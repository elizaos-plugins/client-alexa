// src/index.ts
import { elizaLogger as elizaLogger2 } from "@elizaos/core";

// src/alexa-client.ts
import { elizaLogger } from "@elizaos/core";
import { DefaultApiClient } from "ask-sdk-core";
import { services } from "ask-sdk-model";
import axios from "axios";

// ../../node_modules/uuid/dist/esm-node/rng.js
import crypto from "crypto";
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// ../../node_modules/uuid/dist/esm-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

// ../../node_modules/uuid/dist/esm-node/native.js
import crypto2 from "crypto";
var native_default = {
  randomUUID: crypto2.randomUUID
};

// ../../node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/alexa-client.ts
var AlexaClient = class {
  // private bot: services.proactiveEvents.ProactiveEventsServiceClient; Use for conversations
  LwaServiceClient;
  apiConfiguration;
  runtime;
  skillId;
  clientId;
  clientSecret;
  constructor(runtime) {
    elizaLogger.log("\u{1F4F1} Constructing new AlexaClient...");
    this.runtime = runtime;
    this.apiConfiguration = {
      apiClient: new DefaultApiClient(),
      apiEndpoint: "https://api.amazonalexa.com"
    };
    this.skillId = runtime.getSetting("ALEXA_SKILL_ID");
    this.clientId = runtime.getSetting("ALEXA_CLIENT_ID");
    this.clientSecret = runtime.getSetting("ALEXA_CLIENT_SECRET");
  }
  async start() {
    elizaLogger.log("\u{1F680} Starting Alexa bot...");
    try {
      await this.initializeBot();
    } catch (error) {
      elizaLogger.error("\u274C Failed to launch Alexa bot:", error);
      throw error;
    }
  }
  async stop() {
    elizaLogger.log("\u{1F680} Stopping Alexa bot...");
  }
  async initializeBot() {
    const authenticationConfiguration = {
      clientId: this.clientId,
      clientSecret: this.clientSecret
    };
    this.LwaServiceClient = new services.LwaServiceClient({
      apiConfiguration: this.apiConfiguration,
      authenticationConfiguration
    });
    elizaLogger.log("\u2728 Alexa bot successfully launched and is running!");
    const access_token = await this.LwaServiceClient.getAccessTokenForScope(
      "alexa::proactive_events"
    );
    await this.sendProactiveEvent(access_token);
  }
  async sendProactiveEvent(access_token) {
    const event = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      referenceId: v4_default(),
      expiryTime: new Date(Date.now() + 10 * 6e4).toISOString(),
      event: {
        name: "AMAZON.MessageAlert.Activated",
        payload: {
          state: {
            status: "UNREAD",
            freshness: "NEW"
          },
          messageGroup: {
            creator: {
              name: "Eliza"
            },
            count: 1
          }
        }
      },
      localizedAttributes: [
        {
          locale: "en-US",
          source: "localizedattribute:source"
        }
      ],
      relevantAudience: {
        type: "Multicast",
        payload: {}
      }
    };
    try {
      const response = await axios.post(
        "https://api.amazonalexa.com/v1/proactiveEvents/stages/development",
        event,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`
          }
        }
      );
      switch (response.status) {
        case 202:
          elizaLogger.log("\u2705 Proactive event sent successfully.");
          break;
        case 400:
          elizaLogger.error(
            `${response.data.code} - ${response.data.message}}`
          );
          break;
        case 401:
          elizaLogger.error("Unauthorized");
          break;
      }
    } catch (error) {
      elizaLogger.error("Error", error);
    }
  }
};

// src/index.ts
var AlexaClientInterface = {
  name: "alexa",
  start: async (runtime) => {
    const alexaClient = new AlexaClient(runtime);
    await alexaClient.start();
    elizaLogger2.success(
      `\u2705 Alexa client successfully started for character ${runtime.character.name}`
    );
    return alexaClient;
  }
};
var alexaPlugin = {
  name: "alexa",
  description: "Alexa client plugin",
  clients: [AlexaClientInterface]
};
var index_default = alexaPlugin;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map