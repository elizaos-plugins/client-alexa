import { type Client, type IAgentRuntime, elizaLogger, type Plugin } from "@elizaos/core";
import { AlexaClient } from "./alexa-client";

const AlexaClientInterface: Client = {
    name: 'alexa',
    start: async (runtime: IAgentRuntime) => {
        const alexaClient = new AlexaClient(runtime);

        await alexaClient.start();

        elizaLogger.success(
            `✅ Alexa client successfully started for character ${runtime.character.name}`
        );
        return alexaClient;
    },
};

const alexaPlugin: Plugin = {
    name: "alexa",
    description: "Alexa client plugin",
    clients: [AlexaClientInterface],
};
export default alexaPlugin;
